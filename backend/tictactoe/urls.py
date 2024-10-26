from django.urls import path
from . import views

urlpatterns = [
    path("create/", views.create_game, name="create_game"),
    path("move/<int:game_id>/", views.make_move, name="make_move"),
]
