# covid-attestation

Application Express pour générer les attestations de déplacement de décembre 2020

## Installation

Installation des dépendances :

```bash
npm i
```

Run dev :

```bash
yarn dev
```

Run server :

```bash
yarn start
```

## Analytics
Pour mettre en place Google Analytics.<br>
Initialisez la variable d'environnement `GA_TRACKING_ID` avec votre id (UA-xxxxxxxx-x)

## Usage

### Génération d'attestation

URL : 
```url
POST https://covid-attesation.herokuapp.com/
``` 

| Argument        | Type           | Valeur par défaut  |
| ------------- |-------------| ----|
| nom | String | "" |
| prenom | String | "" |
| dateNaissance | String | "" |
| lieuNaissance | String | "" |
| adresse | String | "" |
| ville | String | "" |
| codePostal | String | "" |
| dateSortie | String | "" |
| heureSortie | String | "" |
| motif | String | "" |

## Contact
Twitter : [@LucasStbnr](https://twitter.com/lucasstbnr) & [@Traknna](https://twitter.com/traknna)