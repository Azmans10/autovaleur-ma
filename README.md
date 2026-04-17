# AutoValeur MA

Estimez la valeur de votre voiture d'occasion au Maroc. Application web gratuite, 100% hors-ligne, sans inscription.

**[Voir l'application](https://{GITHUB_USER}.github.io/autovaleur-ma/)**

## Captures d'écran

![Estimer](screenshots/estimer.png)
![Historique](screenshots/historique.png)
![Comparer](screenshots/comparer.png)

## Fonctionnalités

- Estimation basée sur 14 marques et 60+ modèles du marché marocain
- Décomposition transparente du calcul : prix de base, âge, kilométrage, état, carburant, ville, transmission
- Historique local de vos estimations
- Comparateur visuel de deux véhicules avec ratio prix/km
- Interface en français et arabe (RTL complet)
- Fonctionne 100% hors-ligne après la première visite

## Installer comme application (PWA)

### Android (Chrome)

1. Ouvrir l'application dans Chrome
2. Appuyer sur le menu (3 points en haut à droite)
3. Sélectionner "Ajouter à l'écran d'accueil"
4. Confirmer — l'icône apparaît sur votre écran d'accueil

### iOS (Safari)

1. Ouvrir l'application dans Safari
2. Appuyer sur le bouton de partage (carré avec flèche)
3. Sélectionner "Sur l'écran d'accueil"
4. Confirmer — l'icône apparaît sur votre écran d'accueil

## Stack technique

- **Architecture** : Single-file PWA (`index.html` contient tout le HTML, CSS et JS)
- **Framework** : Aucun — vanilla HTML/CSS/JS
- **Stockage** : localStorage (estimations, préférences)
- **Hébergement** : GitHub Pages (zéro serveur, zéro coût)
- **Offline** : Service Worker cache-first avec précaching

## Contribuer

1. Fork le repo
2. Éditer `index.html`
3. Tester localement (ouvrir `index.html` dans un navigateur)
4. Créer une Pull Request

## Licence

MIT
