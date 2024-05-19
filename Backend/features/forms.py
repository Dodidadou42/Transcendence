from django import forms

class createCustomGameForm(forms.Form):
    mode = forms.CharField(max_length=10)

class newTournamentPseudoForm(forms.Form):
    newPseudo = forms.CharField(max_length=15)

class contactMailForm(forms.Form):
    email = forms.EmailField(max_length=255)
    name = forms.CharField(max_length=255)
    topic = forms.CharField(max_length=255)
    mess = forms.CharField(max_length=255)