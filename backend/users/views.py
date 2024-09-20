
import pyotp, qrcode, os, jwt, datetime, pytz

from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import login
from django.shortcuts import render, redirect
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from django.conf import settings

from .forms import CustomUserCreationForm, UserProfileForm
from .models import CustomUser
from .utils import generate_key_qrcode, generate_jwt



def generate_key_qrcode(user):
    secret = pyotp.random_base32()
    qrcode_url = pyotp.totp.TOTP(secret).provisioning_uri(name=user.username, issuer_name="PONG")
    
    file_path = os.path.join(settings.MEDIA_ROOT, 'qr_codes', f'{user.username}_qrcode.png')
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    qrcode.make(qrcode_url).save(file_path)
    
    user.google_auth_key = secret
    user.qrcode_img.name = f'qr_codes/{user.username}_qrcode.png'
    user.is_2fa_set = False
    user.save()
    
    
    
def generate_jwt(user):
    utc = pytz.UTC
    expiration_time = datetime.datetime.now(utc) + datetime.timedelta(hours=1)
    payload = {
        'user_id': user.id,
        'username': user.username,
        'exp': expiration_time
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    return token


def reset_2fa_view(request):
    user_id = request.session['user_id']
    user = CustomUser.objects.get(id=user_id)
    generate_key_qrcode(user)
    return redirect("verify_otp")
    

def verify_otp_view(request):
    
    user_id = request.session['user_id']
    user = CustomUser.objects.get(id=user_id)
    obj = {
        "error": False,
        "error_message": "Invalid OTP",
        "user": user
    }
    
    if request.method == "POST":
        
        otp = request.POST['otp']
        key = user.google_auth_key
        totp = pyotp.TOTP(key)
        
        if totp.verify(otp):
            login(request, user)
            # set the variable to true for not showing the qrcode again
            user.is_2fa_set = True 
            user.save()
            
            token = generate_jwt(user)
            print(token)
            response = redirect("home")
            response.set_cookie("jwt", token, httponly=True, secure=True)
            return response
        else:
            obj["error"] = True
    
    return render(request, "users/two_fact_auth.html", obj)
            
          
def login_view(request):
    if request.method == "POST":
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            user = form.get_user()
            request.session['user_id'] = user.id
            if not user.google_auth_key:
                generate_key_qrcode(user)
            return redirect("verify_otp")
    else:
        form = AuthenticationForm()

    return render(request, "users/login.html", {"form": form})


@login_required
def logout_view(request):
    if request.method == "POST":
        logout(request)
        return redirect("home")
    else:
        return render(request, "users/logout.html")


def register_view(request):
    if request.method == "POST":
        form = CustomUserCreationForm(data=request.POST)
        if form.is_valid():
            form.save()
            form = AuthenticationForm()
            return redirect("login")
    else:
        form = CustomUserCreationForm()

    return render(request, "users/register.html", {"form": form})


@login_required
def profile_view(request):
    return render(request, "users/profile.html")


def edit_profile_view(request):
    if request.method == "POST":
        form = UserProfileForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            form.save()
            return redirect("profile")
    else:
        form = UserProfileForm(instance=request.user)

    return render(request, "users/edit_profile.html", {"form": form})
