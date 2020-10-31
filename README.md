# covid-attestation

Application Express pour générer des attestations de déplacement pour le confinement de fin 2020

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

