Les requêtes présentées ci-dessous apportent des éléments d'analyse basés sur les données de l'étude INCA2. 

Une première requête consiste à obtenir les aliments les plus consommés par région.

```javascript
db.Indiv2.aggregate(
    {$unwind: '$conso'},
    {$group: {_id: {conso:'$conso.nom_commercial', region:"$region"}, sum: {$sum: 1}}},
    {$sort : {sum : -1}},
    {
        "$redact": {
            "$cond": [
                { "$gt": [ { "$strLenCP": "$_id.conso" }, 2] },
                "$$KEEP",
                "$$PRUNE"
            ]
        }
    },
    {$group: {
    _id: "$_id.region",
    "conso": {
        $first: "$_id.conso"
    },
    "sum": {
        $first: "$sum"
    },
}},
{$sort : {_id : 1}});
```

Durant cette agrégation, nous nous sommes retrouvés confrontés au fait que nos données contenaient un produit "x" catégorisant des produits dont le nom commercial n'a pas été fourni. Autrement dit, la plupart des consommations n'ont pas de nom. Nous avons donc décidé de filtrer ce produit non pertinent et d'effectuer l'analyse sur le reste des produits.

Voici le résultat de la requête :
```json
{ "_id" : 1, "conso" : "pr�paration en poudre instantan�e pour boisson cacaot�e", "sum" : 271 }
{ "_id" : 2, "conso" : "pr�paration en poudre instantan�e pour boisson cacaot�e", "sum" : 56 }
{ "_id" : 3, "conso" : "grandlait demi �cr�m� uht", "sum" : 78 }
{ "_id" : 4, "conso" : "grandlait demi �cr�m� uht", "sum" : 58 }
{ "_id" : 5, "conso" : "pr�paration en poudre instantan�e pour boisson cacaot�e", "sum" : 45 }
{ "_id" : 6, "conso" : "pr�paration en poudre instantan�e pour boisson cacaot�e", "sum" : 58 }
{ "_id" : 7, "conso" : "grandlait demi �cr�m� uht", "sum" : 14 }
{ "_id" : 8, "conso" : "grandlait demi �cr�m� uht", "sum" : 113 }
{ "_id" : 9, "conso" : "pr�paration en poudre instantan�e pour boisson cacaot�e", "sum" : 101 }
{ "_id" : 10, "conso" : "grandlait demi �cr�m� uht", "sum" : 35 }
{ "_id" : 11, "conso" : "boisson nature � base d'eau min�rale naturelle", "sum" : 27 }
{ "_id" : 12, "conso" : "pr�paration en poudre instantan�e pour boisson cacaot�e", "sum" : 55 }
{ "_id" : 13, "conso" : "pr�paration en poudre instantan�e pour boisson cacaot�e", "sum" : 72 }
{ "_id" : 14, "conso" : "pr�paration en poudre instantan�e pour boisson cacaot�e", "sum" : 62 }
{ "_id" : 15, "conso" : "grandlait demi �cr�m� uht", "sum" : 67 }
{ "_id" : 16, "conso" : "grandlait demi �cr�m� uht", "sum" : 43 }
{ "_id" : 17, "conso" : "pr�paration en poudre instantan�e pour boisson cacaot�e", "sum" : 30 }
{ "_id" : 18, "conso" : "grandlait demi �cr�m� uht", "sum" : 120 }
{ "_id" : 19, "conso" : "mati�re grasse all�g�e doux 38%mg", "sum" : 25 }
{ "_id" : 20, "conso" : "pr�paration en poudre instantan�e pour boisson cacaot�e", "sum" : 51 }
{ "_id" : 21, "conso" : "pr�paration en poudre instantan�e pour boisson cacaot�e", "sum" : 90 }
```
Remarque : "_id" correspond au numéro de la région.

Il s'est avéré que les résultats n'étaient pas si intéressants étant donné qu'ils rendent principalement compte de la consommation de lait et de chocolat chaud.

De manière similaire, la requête suivante regroupe les produits les plus consommés par les différentes classes d'âge étudiées (en filtrant "x") :

```javascript
db.Indiv2.aggregate(
    {$unwind: '$conso'},
    {$group: {_id: {conso:'$conso.nom_commercial', clage:"$clage"}, sum: {$sum: 1}}},
    {$sort : {sum : -1}},
    {
        "$redact": {
            "$cond": [
                { "$gt": [ { "$strLenCP": "$_id.conso" }, 2] },
                "$$KEEP",
                "$$PRUNE"
            ]
        }
    },
    {$group: {
    _id: "$_id.clage",
    "conso": {
        $first: "$_id.conso"
    },
    "sum": {
        $first: "$sum"
    },
}},
{$sort : {_id : 1}});
 ```
 Résultat :
```json
    { "_id" : 1, "conso" : "pr�paration en poudre instantan�e pour boisson cacaot�e", "sum" : 558 }
    { "_id" : 2, "conso" : "pr�paration en poudre instantan�e pour boisson cacaot�e", "sum" : 249 }
    { "_id" : 3, "conso" : "grandlait demi �cr�m� uht", "sum" : 218 }
    { "_id" : 4, "conso" : "grandlait demi �cr�m� uht", "sum" : 526 }
    { "_id" : "", "conso" : "petits filous aux fruits", "sum" : 9 }
```
// IMPORTANT : je ne trouve pas la nomenclature pour les classes d'âge (clage)...

Similaire aux précédentes, la requête suivante a été modifiée pour obtenir l'élément le plus consommé par tranche de revenu (15 au total).

```javascript
db.Indiv3.aggregate(
    {$unwind: '$menage'},
    {$unwind: '$conso'},
    {$group: {_id: {revenu:'$menage.revenu', conso:"$conso.nom_commercial"}, sum: {$sum: 1}}},
    {$sort : {sum : -1}},
     {
        "$redact": {
            "$cond": [
                { "$gt": [ { "$strLenCP": "$_id.conso" }, 2] },
                "$$KEEP",
                "$$PRUNE"
            ]
        }
    },
    {$group: {
    _id: "$_id.revenu",
    "conso": {
        $first: "$_id.conso"
    },
    "sum": {
        $first: "$sum"
    },
}},
{$sort : {_id : 1}});
```

Ce qui nous donne :

```json
{ "_id" : 1, "conso" : "pr�paration en poudre instantan�e pour boisson cacaot�e", "sum" : 41 }
{ "_id" : 2, "conso" : "mati�re grasse all�g�e doux 38%mg", "sum" : 34 }
{ "_id" : 3, "conso" : "grandlait demi �cr�m� uht", "sum" : 43 }
{ "_id" : 4, "conso" : "pr�paration en poudre instantan�e pour boisson cacaot�e", "sum" : 69 }
{ "_id" : 5, "conso" : "grandlait demi �cr�m� uht", "sum" : 55 }
{ "_id" : 6, "conso" : "grandlait demi �cr�m� uht", "sum" : 109 }
{ "_id" : 7, "conso" : "pr�paration en poudre instantan�e pour boisson cacaot�e", "sum" : 114 }
{ "_id" : 8, "conso" : "grandlait demi �cr�m� uht", "sum" : 72 }
{ "_id" : 9, "conso" : "pr�paration en poudre instantan�e pour boisson cacaot�e", "sum" : 129 }
{ "_id" : 10, "conso" : "pr�paration en poudre instantan�e pour boisson cacaot�e", "sum" : 101 }
{ "_id" : 11, "conso" : "pr�paration en poudre instantan�e pour boisson cacaot�e", "sum" : 163 }
{ "_id" : 12, "conso" : "pr�paration en poudre instantan�e pour boisson cacaot�e", "sum" : 158 }
{ "_id" : 13, "conso" : "pr�paration en poudre instantan�e pour boisson cacaot�e", "sum" : 94 }
{ "_id" : 14, "conso" : "pr�paration en poudre instantan�e pour boisson cacaot�e", "sum" : 69 }
{ "_id" : 15, "conso" : "grandlait demi �cr�m� uht", "sum" : 188 }
```

Encore une fois, nos données ne fournissent pas de résultat intéressant. En effet, la plupart des noms de produit n'ont pas malheureusement pas été fournis.

//REMARQUE : il faudrait trouver un moyen de décoder les caractères utf comme �

// Pour chaque région, donne la moyenne du nombre de consommations par habitant
//  puis trie dans l'ordre décroissant
// Donne aussi le nombre moyen de conso au petit déjeuner, déjeuner et diner.
// Note1 : le second terme de divide est le nombre de jours (dans la semaine)
// Note2 : Il faudra ajouter le nom des régions

```javascript
db.Indiv_complete.aggregate( [
   {
     $group : {
        _id : "$region",
        nbConso: { $avg: { $size:"$conso" } },
        consoParMatin: { $avg: {  $divide: [ 
            {$size: { $filter: { 
                input:"$conso", 
                as:"cons", 
                cond:
                {$eq: ["$$cons.tyrep",1]}
                } } },
            7 ] } },
        consoParDejeuner: { $avg: { $divide: [ 
            {$size: { $filter: { 
                input:"$conso", 
                as:"cons", 
                cond:
                {$eq: ["$$cons.tyrep",3]}
                } } },
            7 ] } },
        consoParDiner: { $avg: { $divide: [ 
            {$size: { $filter: { 
                input:"$conso", 
                as:"cons", 
                cond:
                {$eq: ["$$cons.tyrep",5]}
                } } },
            7 ] } }
     }
   },
   {
     $sort: { "nbConso": -1 }
   }
] )
```
//Voici les résultats :

```json
{ "_id" : 12, "nbConso" : 143.50222222222223, "consoParMatin" : 3.9409523809523828, "consoParDejeuner" : 7.461587301587303, "consoParDiner" : 6.3784126984127 }
{ "_id" : 6, "nbConso" : 142.6985294117647, "consoParMatin" : 3.538865546218487, "consoParDejeuner" : 7.389705882352942, "consoParDiner" : 6.756302521008405 }
{ "_id" : 16, "nbConso" : 141.8562091503268, "consoParMatin" : 3.526610644257704, "consoParDejeuner" : 7.5359477124183005, "consoParDiner" : 6.549019607843135 }
{ "_id" : 17, "nbConso" : 140.72727272727272, "consoParMatin" : 3.571428571428571, "consoParDejeuner" : 7.282467532467532, "consoParDiner" : 6.532467532467533 }
{ "_id" : 14, "nbConso" : 140.52439024390245, "consoParMatin" : 3.7883275261324045, "consoParDejeuner" : 7.260452961672474, "consoParDiner" : 6.401567944250871 }
{ "_id" : 13, "nbConso" : 139.02727272727273, "consoParMatin" : 3.848701298701298, "consoParDejeuner" : 7.130519480519478, "consoParDiner" : 6.234415584415581 }
{ "_id" : 15, "nbConso" : 135.50409836065575, "consoParMatin" : 3.582552693208433, "consoParDejeuner" : 7.083138173302106, "consoParDiner" : 6.2775175644028085 }
{ "_id" : 18, "nbConso" : 135.2478134110787, "consoParMatin" : 3.2952936276551434, "consoParDejeuner" : 7.104539775093715, "consoParDiner" : 6.04623073719284 }
{ "_id" : 21, "nbConso" : 133.62995594713655, "consoParMatin" : 3.5651353052234125, "consoParDejeuner" : 6.828193832599122, "consoParDiner" : 6.169288860918815 }
{ "_id" : 3, "nbConso" : 133.32432432432432, "consoParMatin" : 3.385135135135137, "consoParDejeuner" : 6.5135135135135185, "consoParDiner" : 6.2722007722007715 }
{ "_id" : 20, "nbConso" : 133.16141732283464, "consoParMatin" : 3.3098987626546688, "consoParDejeuner" : 6.864454443194601, "consoParDiner" : 6.202474690663669 }
{ "_id" : 11, "nbConso" : 132.9770992366412, "consoParMatin" : 3.5834242093784088, "consoParDejeuner" : 7.006543075245364, "consoParDiner" : 5.904034896401311 }
{ "_id" : 9, "nbConso" : 132.94329896907217, "consoParMatin" : 3.5913107511045648, "consoParDejeuner" : 6.658321060382916, "consoParDiner" : 5.692930780559649 }
{ "_id" : 4, "nbConso" : 132.5530303030303, "consoParMatin" : 3.3809523809523836, "consoParDejeuner" : 6.471861471861475, "consoParDiner" : 6.426406926406927 }
{ "_id" : 19, "nbConso" : 132.32478632478632, "consoParMatin" : 3.2918192918192926, "consoParDejeuner" : 7.096459096459098, "consoParDiner" : 5.948717948717948 }
{ "_id" : 5, "nbConso" : 132.15270935960592, "consoParMatin" : 3.4257565095003524, "consoParDejeuner" : 6.972554539056997, "consoParDiner" : 6.102744546094301 }
{ "_id" : 2, "nbConso" : 130.35658914728683, "consoParMatin" : 3.5681063122923593, "consoParDejeuner" : 6.812846068660022, "consoParDiner" : 5.866002214839425 }
{ "_id" : 1, "nbConso" : 125.51747088186356, "consoParMatin" : 3.4242928452579027, "consoParDejeuner" : 5.980270976943188, "consoParDiner" : 5.963632041835029 }
{ "_id" : 7, "nbConso" : 123.38235294117646, "consoParMatin" : 3.3676470588235285, "consoParDejeuner" : 6.882352941176471, "consoParDiner" : 5.567226890756303 }
{ "_id" : 10, "nbConso" : 122.36974789915966, "consoParMatin" : 3.2965186074429766, "consoParDejeuner" : 5.905162064825934, "consoParDiner" : 5.423769507803121 }
{ "_id" : 8, "nbConso" : 117.79735682819383, "consoParMatin" : 3.3354310887350533, "consoParDejeuner" : 5.80302076777848, "consoParDiner" : 5.057268722466957 }
```
// On ajoute en plus le poids moyen, voir s'il y a une corrélation avec la quantité du nombre de conso

```javascript
db.Indiv_complete.aggregate( [
   {
     $group : {
        _id : "$region",
        nbConso: { $avg: { $size:"$conso" } },

        consoParMatin: { $avg: {  $divide: [ 
            {$size: { $filter: { 
                input:"$conso", 
                as:"cons", 
                cond:
                {$eq: ["$$cons.tyrep",1]}
                } } },
            7 ] } },
        consoParDejeuner: { $avg: { $divide: [ 
            {$size: { $filter: { 
                input:"$conso", 
                as:"cons", 
                cond:
                {$eq: ["$$cons.tyrep",3]}
                } } },
            7 ] } },
        consoParDiner: { $avg: { $divide: [ 
            {$size: { $filter: { 
                input:"$conso", 
                as:"cons", 
                cond:
                {$eq: ["$$cons.tyrep",5]}
                } } },
            7 ] } },

        poidsMoy: { $avg: "$poids" }
     }
   },
   {
     $sort: { "nbConso": -1 }
   }
] )
```
//Résultat : aucune corrélation, ce qui n'est absolument pas étonnant

```json
{ "_id" : 12, "nbConso" : 143.50222222222223, "consoParMatin" : 3.9409523809523828, "consoParDejeuner" : 7.461587301587303, "consoParDiner" : 6.3784126984127, "poidsMoy" : 57.9237668161435 }
{ "_id" : 6, "nbConso" : 142.6985294117647, "consoParMatin" : 3.538865546218487, "consoParDejeuner" : 7.389705882352942, "consoParDiner" : 6.756302521008405, "poidsMoy" : 62.323880597014934 }
{ "_id" : 16, "nbConso" : 141.8562091503268, "consoParMatin" : 3.526610644257704, "consoParDejeuner" : 7.5359477124183005, "consoParDiner" : 6.549019607843135, "poidsMoy" : 58.67615894039734 }
{ "_id" : 17, "nbConso" : 140.72727272727272, "consoParMatin" : 3.571428571428571, "consoParDejeuner" : 7.282467532467532, "consoParDiner" : 6.532467532467533, "poidsMoy" : 66.13636363636364 }
{ "_id" : 14, "nbConso" : 140.52439024390245, "consoParMatin" : 3.7883275261324045, "consoParDejeuner" : 7.260452961672474, "consoParDiner" : 6.401567944250871, "poidsMoy" : 57.67484662576687 }
{ "_id" : 13, "nbConso" : 139.02727272727273, "consoParMatin" : 3.848701298701298, "consoParDejeuner" : 7.130519480519478, "consoParDiner" : 6.234415584415581, "poidsMoy" : 59.86986301369861 }
{ "_id" : 15, "nbConso" : 135.50409836065575, "consoParMatin" : 3.582552693208433, "consoParDejeuner" : 7.083138173302106, "consoParDiner" : 6.2775175644028085, "poidsMoy" : 60.60532786885246 }
{ "_id" : 18, "nbConso" : 135.2478134110787, "consoParMatin" : 3.2952936276551434, "consoParDejeuner" : 7.104539775093715, "consoParDiner" : 6.04623073719284, "poidsMoy" : 59.938235294117646 }
{ "_id" : 21, "nbConso" : 133.62995594713655, "consoParMatin" : 3.5651353052234125, "consoParDejeuner" : 6.828193832599122, "consoParDiner" : 6.169288860918815, "poidsMoy" : 59.50133928571428 }
{ "_id" : 3, "nbConso" : 133.32432432432432, "consoParMatin" : 3.385135135135137, "consoParDejeuner" : 6.5135135135135185, "consoParDiner" : 6.2722007722007715, "poidsMoy" : 62.28445945945946 }
{ "_id" : 20, "nbConso" : 133.16141732283464, "consoParMatin" : 3.3098987626546688, "consoParDejeuner" : 6.864454443194601, "consoParDiner" : 6.202474690663669, "poidsMoy" : 61.8204 }
{ "_id" : 11, "nbConso" : 132.9770992366412, "consoParMatin" : 3.5834242093784088, "consoParDejeuner" : 7.006543075245364, "consoParDiner" : 5.904034896401311, "poidsMoy" : 59.28527131782946 }
{ "_id" : 9, "nbConso" : 132.94329896907217, "consoParMatin" : 3.5913107511045648, "consoParDejeuner" : 6.658321060382916, "consoParDiner" : 5.692930780559649, "poidsMoy" : 59.67061855670103 }
{ "_id" : 4, "nbConso" : 132.5530303030303, "consoParMatin" : 3.3809523809523836, "consoParDejeuner" : 6.471861471861475, "consoParDiner" : 6.426406926406927, "poidsMoy" : 59.28914728682171 }
{ "_id" : 19, "nbConso" : 132.32478632478632, "consoParMatin" : 3.2918192918192926, "consoParDejeuner" : 7.096459096459098, "consoParDiner" : 5.948717948717948, "poidsMoy" : 60.15470085470086 }
{ "_id" : 5, "nbConso" : 132.15270935960592, "consoParMatin" : 3.4257565095003524, "consoParDejeuner" : 6.972554539056997, "consoParDiner" : 6.102744546094301, "poidsMoy" : 62.7579207920792 }
{ "_id" : 2, "nbConso" : 130.35658914728683, "consoParMatin" : 3.5681063122923593, "consoParDejeuner" : 6.812846068660022, "consoParDiner" : 5.866002214839425, "poidsMoy" : 60.571875 }
{ "_id" : 1, "nbConso" : 125.51747088186356, "consoParMatin" : 3.4242928452579027, "consoParDejeuner" : 5.980270976943188, "consoParDiner" : 5.963632041835029, "poidsMoy" : 58.18271812080536 }
{ "_id" : 7, "nbConso" : 123.38235294117646, "consoParMatin" : 3.3676470588235285, "consoParDejeuner" : 6.882352941176471, "consoParDiner" : 5.567226890756303, "poidsMoy" : 61.58656716417911 }
{ "_id" : 10, "nbConso" : 122.36974789915966, "consoParMatin" : 3.2965186074429766, "consoParDejeuner" : 5.905162064825934, "consoParDiner" : 5.423769507803121, "poidsMoy" : 64.23135593220337 }
{ "_id" : 8, "nbConso" : 117.79735682819383, "consoParMatin" : 3.3354310887350533, "consoParDejeuner" : 5.80302076777848, "consoParDiner" : 5.057268722466957, "poidsMoy" : 60.56637168141593 }
```

// Poids par tranche d'age et par sexe

```javascript
db.Indiv_complete.aggregate( [
   {
     $group : {
        _id : { classe_age: "$tage", sexe: "$sexe_ps" },

        poidsMoy: { $avg: "$poids" }
     }
   },
   {
     $sort: { "_id": 1 }
   }
] )
```

//Résultat:

```json
{ "_id" : { "classe_age" : 1, "sexe" : 1 }, "poidsMoy" : 24.89280575539568 }
{ "_id" : { "classe_age" : 1, "sexe" : 2 }, "poidsMoy" : 25.324406779661018 }
{ "_id" : { "classe_age" : 2, "sexe" : 1 }, "poidsMoy" : 46.9388625592417 }
{ "_id" : { "classe_age" : 2, "sexe" : 2 }, "poidsMoy" : 48.04567901234568 }
{ "_id" : { "classe_age" : 3, "sexe" : 1 }, "poidsMoy" : 65.4819095477387 }
{ "_id" : { "classe_age" : 3, "sexe" : 2 }, "poidsMoy" : 55.92321428571428 }
{ "_id" : { "classe_age" : 4, "sexe" : 1 }, "poidsMoy" : 72.93490566037737 }
{ "_id" : { "classe_age" : 4, "sexe" : 2 }, "poidsMoy" : 60.58648648648648 }
{ "_id" : { "classe_age" : 5, "sexe" : 1 }, "poidsMoy" : 78.16227544910178 }
{ "_id" : { "classe_age" : 5, "sexe" : 2 }, "poidsMoy" : 60.94007633587786 }
{ "_id" : { "classe_age" : 6, "sexe" : 1 }, "poidsMoy" : 78.73161094224925 }
{ "_id" : { "classe_age" : 6, "sexe" : 2 }, "poidsMoy" : 63.23995983935745 }
{ "_id" : { "classe_age" : 7, "sexe" : 1 }, "poidsMoy" : 79.26374622356497 }
{ "_id" : { "classe_age" : 7, "sexe" : 2 }, "poidsMoy" : 66.98117359413203 }
{ "_id" : { "classe_age" : 8, "sexe" : 1 }, "poidsMoy" : 78.7953642384106 }
{ "_id" : { "classe_age" : 8, "sexe" : 2 }, "poidsMoy" : 66.45794871794872 }
```

// Ne concerne que les adultes,
// Donne le poids moyen selon la consommation de viande, volaille, poisson et oeufs
// (là encore, des codes)

```javascript
db.Indiv_complete.aggregate( [
   {
       $match: { ech : 1 } 
   },
   {
     $group : {
        _id : { freq_conso_viande: "$fqvpo" },
        poidsMoy: { $avg: "$poids" }
     }
   },
   {
     $sort: { "_id": 1 }
   }
] )
```

//Résultats :
```json
{ "_id" : { "freq_conso_viande" : 1 }, "poidsMoy" : 60.98333333333333 }
{ "_id" : { "freq_conso_viande" : 2 }, "poidsMoy" : 69.54666666666667 }
{ "_id" : { "freq_conso_viande" : 3 }, "poidsMoy" : 70.57154150197628 }
{ "_id" : { "freq_conso_viande" : 4 }, "poidsMoy" : 66.83516483516483 }
{ "_id" : { "freq_conso_viande" : 5 }, "poidsMoy" : 69.34193548387097 }
{ "_id" : { "freq_conso_viande" : 6 }, "poidsMoy" : 71.93162162162162 }
{ "_id" : { "freq_conso_viande" : 7 }, "poidsMoy" : 66.25555555555556 }
{ "_id" : { "freq_conso_viande" : 8 }, "poidsMoy" : 73.55535714285715 }
{ "_id" : { "freq_conso_viande" : 9 }, "poidsMoy" : 71.25704697986576 }
{ "_id" : { "freq_conso_viande" : 99 }, "poidsMoy" : 70.905 }
{ "_id" : { "freq_conso_viande" : "" }, "poidsMoy" : 72.8111111111111 }
```

// Ne concerne que les adultes,
// Compte le nombre d'individu partis en vacances (1) ou non (2) durant les 12 derniers mois
//  selon leur groupe de revenus

```javascript
db.Indiv.aggregate( [
   {
       $match: { $and: [
           {"menage.revenu" : {$lt : 14} },
           { vacances : {$lt : 3} },
           { vacances : {$gt : 0} },
           { ech : 1 }
       ]}
   },
   {
     $group : {
        _id : { revenus: "$menage.revenu", revenus_label: "$menage.revenu_lab.revenu.label", a_eut_des_vacances: "$vacances_lab.vacances_label" },

        count: { $sum: 1 }
     }
   },
   {
     $sort: { "_id": 1 }
   }
] )
```

//résultats :
```json
{ "_id" : { "revenus" : [ 1 ], "revenus_label" : [ ], "a_eut_des_vacances" : "non" }, "count" : 28 }
{ "_id" : { "revenus" : [ 1 ], "revenus_label" : [ ], "a_eut_des_vacances" : "oui" }, "count" : 34 }
{ "_id" : { "revenus" : [ 2 ], "revenus_label" : [ ], "a_eut_des_vacances" : "non" }, "count" : 51 }
{ "_id" : { "revenus" : [ 2 ], "revenus_label" : [ ], "a_eut_des_vacances" : "oui" }, "count" : 56 }
{ "_id" : { "revenus" : [ 3 ], "revenus_label" : [ ], "a_eut_des_vacances" : "non" }, "count" : 60 }
{ "_id" : { "revenus" : [ 3 ], "revenus_label" : [ ], "a_eut_des_vacances" : "oui" }, "count" : 67 }
{ "_id" : { "revenus" : [ 4 ], "revenus_label" : [ ], "a_eut_des_vacances" : "non" }, "count" : 70 }
{ "_id" : { "revenus" : [ 4 ], "revenus_label" : [ ], "a_eut_des_vacances" : "oui" }, "count" : 67 }
{ "_id" : { "revenus" : [ 5 ], "revenus_label" : [ ], "a_eut_des_vacances" : "non" }, "count" : 48 }
{ "_id" : { "revenus" : [ 5 ], "revenus_label" : [ ], "a_eut_des_vacances" : "oui" }, "count" : 60 }
{ "_id" : { "revenus" : [ 6 ], "revenus_label" : [ ], "a_eut_des_vacances" : "non" }, "count" : 102 }
{ "_id" : { "revenus" : [ 6 ], "revenus_label" : [ ], "a_eut_des_vacances" : "oui" }, "count" : 166 }
{ "_id" : { "revenus" : [ 7 ], "revenus_label" : [ ], "a_eut_des_vacances" : "non" }, "count" : 82 }
{ "_id" : { "revenus" : [ 7 ], "revenus_label" : [ ], "a_eut_des_vacances" : "oui" }, "count" : 136 }
{ "_id" : { "revenus" : [ 8 ], "revenus_label" : [ ], "a_eut_des_vacances" : "non" }, "count" : 55 }
{ "_id" : { "revenus" : [ 8 ], "revenus_label" : [ ], "a_eut_des_vacances" : "oui" }, "count" : 128 }
{ "_id" : { "revenus" : [ 9 ], "revenus_label" : [ ], "a_eut_des_vacances" : "non" }, "count" : 53 }
{ "_id" : { "revenus" : [ 9 ], "revenus_label" : [ ], "a_eut_des_vacances" : "oui" }, "count" : 129 }
{ "_id" : { "revenus" : [ 10 ], "revenus_label" : [ ], "a_eut_des_vacances" : "non" }, "count" : 33 }
{ "_id" : { "revenus" : [ 10 ], "revenus_label" : [ ], "a_eut_des_vacances" : "oui" }, "count" : 138 }
{ "_id" : { "revenus" : [ 11 ], "revenus_label" : [ ], "a_eut_des_vacances" : "non" }, "count" : 43 }
{ "_id" : { "revenus" : [ 11 ], "revenus_label" : [ ], "a_eut_des_vacances" : "oui" }, "count" : 175 }
{ "_id" : { "revenus" : [ 12 ], "revenus_label" : [ ], "a_eut_des_vacances" : "non" }, "count" : 27 }
{ "_id" : { "revenus" : [ 12 ], "revenus_label" : [ ], "a_eut_des_vacances" : "oui" }, "count" : 191 }
{ "_id" : { "revenus" : [ 13 ], "revenus_label" : [ ], "a_eut_des_vacances" : "non" }, "count" : 8 }
{ "_id" : { "revenus" : [ 13 ], "revenus_label" : [ ], "a_eut_des_vacances" : "oui" }, "count" : 105 }

```

// Relation rapide entre fumeur et moyenne de poids, selon le sexe
// Les valeurs de fume dans l'ordre croissant :
// Fume quotidiennement, fume occasionnellement (< 1/jour), ne fume plus, n'a jamais fumé

```javascript
db.Indiv.aggregate( [
   {
       $match: { $and: [
           { fume : {$lt : 5} },
           { fume : {$gt : 0} },
           { ech : 1 }
       ]}
   },
   {
     $group : {
        _id : { sexe: "$sexe_lab.sexe_label", fumeur: "$fume", fumeur_label: "$fume_lab.fume_label" },

        count: { $sum: 1 },
        poidsMoy: { $avg: "$poids" }
     }
   },
   {
     $sort: { "_id": 1 }
   }
] )
```

//résultat

```json
{ "_id" : { "sexe" : "Feminin", "fumeur" : 1, "fumeur_label" : "oui quotidiennement" }, "count" : 375, "poidsMoy" : 61.90999999999999 }
{ "_id" : { "sexe" : "Feminin", "fumeur" : 2, "fumeur_label" : "oui occasionnellement (<1/jour)" }, "count" : 69, "poidsMoy" : 63.46521739130435 }
{ "_id" : { "sexe" : "Feminin", "fumeur" : 3, "fumeur_label" : "non mais a deja fume" }, "count" : 325, "poidsMoy" : 65.00696202531644 }
{ "_id" : { "sexe" : "Feminin", "fumeur" : 4, "fumeur_label" : "non n'a jamais fume" }, "count" : 728, "poidsMoy" : 64.58995815899584 }
{ "_id" : { "sexe" : "Masculin", "fumeur" : 1, "fumeur_label" : "oui quotidiennement" }, "count" : 316, "poidsMoy" : 75.65445859872611 }
{ "_id" : { "sexe" : "Masculin", "fumeur" : 2, "fumeur_label" : "oui occasionnellement (<1/jour)" }, "count" : 48, "poidsMoy" : 77.96458333333334 }
{ "_id" : { "sexe" : "Masculin", "fumeur" : 3, "fumeur_label" : "non mais a deja fume" }, "count" : 382, "poidsMoy" : 80.78403141361257 }
{ "_id" : { "sexe" : "Masculin", "fumeur" : 4, "fumeur_label" : "non n'a jamais fume" }, "count" : 326, "poidsMoy" : 77.81753846153845 }


```
