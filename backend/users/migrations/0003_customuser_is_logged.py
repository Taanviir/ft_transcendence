# Generated by Django 5.0.6 on 2024-09-21 13:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_customuser_token_version'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='is_logged',
            field=models.BooleanField(default=False),
        ),
    ]
