from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.db.models import Q

from .friendship import Friendship


class CustomUser(AbstractUser):
    username = models.CharField(max_length=20, unique=True)
    email = models.EmailField(
        error_messages={"unique": "A user with that email already exists."},
        blank=True,
        max_length=254,
        verbose_name="email address",
        unique=True,
    )
    profile_image = models.ImageField(
        upload_to="profile_images/", blank=True, null=True
    )
    bio = models.TextField(blank=True, null=True)
    github = models.URLField(max_length=200, blank=True, null=True)
    twitter = models.URLField(max_length=200, blank=True, null=True)
    nick_name = models.CharField(max_length=100, null=True, blank=True)
    google_auth_key = models.CharField(max_length=200, null=True, default=None)
    is_2fa_set = models.BooleanField(default=False)
    qrcode_img = models.ImageField(upload_to="qr_codes/", blank=True, null=True)
    token_version = models.IntegerField(default=0)
    is_authenticated = models.BooleanField(default=False)
    is_42 = models.BooleanField(default=False)
    last_activity = models.DateTimeField(default=timezone.now)
    friends = models.ManyToManyField(
        "self", through="Friendship", symmetrical=False, related_name="related_to"
    )
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)

    def add_friend(self, friend):
        friendship, created = Friendship.objects.get_or_create(user=self, friend=friend)
        return friendship

    def remove_friend(self, friend):
        Friendship.objects.filter(user=self, friend=friend).delete()
        return not self.is_friend(friend)

    def get_friends(self):
        return CustomUser.objects.filter(
            friendships__friend=self, friendships__status="accepted"
        )

    def get_online_friends(self):
        return CustomUser.objects.filter(
            friendships__friend=self,
            last_activity__gte=timezone.now() - timezone.timedelta(minutes=5),
            friendships__status="accepted",
        )

    def get_pending_requests(self):
        return CustomUser.objects.filter(
            friendships__friend=self, friendships__status="pending"
        )

    def is_friend(self, user):
        return Friendship.objects.filter(
            Q(user=self, friend=user) | Q(user=user, friend=self), status="accepted"
        ).exists()  # Check for mutual friendship

    def get_all_matches(self):
        """Retrieve all matches for this user."""
        return self.matches.all()  # Access matches through the related name