Les requêtes présentées ci-dessous apportent des éléments d'analyse basés sur les données de l'étude INCA2. 

Une première requête consiste à obtenir les aliments les plus consommés par région.

```javascript
db.Indiv.aggregate(
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
db.Indiv.aggregate(
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

Similaire aux précédentes, la requête suivante a été modifiée pour obtenir l'élément le plus consommé par tranche de revenu (15 au total).

```javascript
db.Indiv.aggregate(
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

// Pour chaque région, donne la moyenne du nombre de consommations par habitant
//  puis trie dans l'ordre décroissant
// Donne aussi le nombre moyen de conso au petit déjeuner, déjeuner et diner.
// On ajoute en plus le poids moyen, voir s'il y a une corrélation avec la quantité du nombre de conso

```javascript
db.Indiv.aggregate( [
   {
     $group : {
        _id : "$region_lab.region_label",
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
{ "_id" : "Pays De Loire", "nbConso" : 145.47340425531914, "consoParMatin" : 4.053191489361703, "consoParDejeuner" : 7.54635258358663, "consoParDiner" : 6.502279635258357, "poidsMoy" : 64.57043010752689 }
{ "_id" : "Basse-Normandie", "nbConso" : 145.10434782608695, "consoParMatin" : 3.6645962732919255, "consoParDejeuner" : 7.50062111801242, "consoParDiner" : 6.860869565217392, "poidsMoy" : 68.11769911504425 }
{ "_id" : "Midi-Pyrenees", "nbConso" : 143.33333333333334, "consoParMatin" : 3.570321151716501, "consoParDejeuner" : 7.679955703211517, "consoParDiner" : 6.5570321151716495, "poidsMoy" : 64.53464566929134 }
{ "_id" : "Poitou Charentes", "nbConso" : 141.46323529411765, "consoParMatin" : 3.837184873949579, "consoParDejeuner" : 7.382352941176469, "consoParDiner" : 6.436974789915965, "poidsMoy" : 64.4888888888889 }
{ "_id" : "Bretagne", "nbConso" : 141.23711340206185, "consoParMatin" : 3.9329896907216484, "consoParDejeuner" : 7.221649484536082, "consoParDiner" : 6.32989690721649, "poidsMoy" : 64.58911917098445 }
{ "_id" : "Limousin", "nbConso" : 140.29268292682926, "consoParMatin" : 3.623693379790941, "consoParDejeuner" : 7.261324041811846, "consoParDiner" : 6.477351916376305, "poidsMoy" : 69.18780487804878 }
{ "_id" : "Aquitaine", "nbConso" : 137.49763033175356, "consoParMatin" : 3.6655382532159813, "consoParDejeuner" : 7.229519295870006, "consoParDiner" : 6.33446174678402, "poidsMoy" : 65.99004739336495 }
{ "_id" : "Rhone-Alpes", "nbConso" : 136.98006644518273, "consoParMatin" : 3.37921214997627, "consoParDejeuner" : 7.2135738016136735, "consoParDiner" : 6.120550545799719, "poidsMoy" : 64.8258389261745 }
{ "_id" : "Haute-Normandie", "nbConso" : 136.38181818181818, "consoParMatin" : 3.500000000000001, "consoParDejeuner" : 6.693506493506496, "consoParDiner" : 6.62987012987013, "poidsMoy" : 66.2411214953271 }
{ "_id" : "Provence Cote D'azur", "nbConso" : 135.7195767195767, "consoParMatin" : 3.674225245653819, "consoParDejeuner" : 6.960695389266818, "consoParDiner" : 6.273620559334843, "poidsMoy" : 66.38010752688173 }
{ "_id" : "Lorraine", "nbConso" : 135.5688622754491, "consoParMatin" : 3.7159965782720272, "consoParDejeuner" : 6.834046193327631, "consoParDiner" : 5.822925577416597, "poidsMoy" : 65.72814371257485 }
{ "_id" : "Franche Compte", "nbConso" : 134.72321428571428, "consoParMatin" : 3.65561224489796, "consoParDejeuner" : 7.103316326530612, "consoParDiner" : 6.024234693877553, "poidsMoy" : 65.62363636363636 }
{ "_id" : "Picardie", "nbConso" : 134.28571428571428, "consoParMatin" : 3.382086167800455, "consoParDejeuner" : 6.591836734693882, "consoParDiner" : 6.395691609977325, "poidsMoy" : 68.67936507936508 }
{ "_id" : "Languedoc", "nbConso" : 133.5450643776824, "consoParMatin" : 3.320049049662784, "consoParDejeuner" : 6.91048436541999, "consoParDiner" : 6.215818516247703, "poidsMoy" : 64.99 }
{ "_id" : "Champagne", "nbConso" : 132.96296296296296, "consoParMatin" : 3.649470899470901, "consoParDejeuner" : 7.01984126984127, "consoParDiner" : 5.97883597883598, "poidsMoy" : 66.69158878504673 }
{ "_id" : "Centre", "nbConso" : 132.4808743169399, "consoParMatin" : 3.4543325526932094, "consoParDejeuner" : 7.04683840749414, "consoParDiner" : 6.107728337236535, "poidsMoy" : 67.08406593406595 }
{ "_id" : "Auvergne", "nbConso" : 130.76, "consoParMatin" : 3.350000000000001, "consoParDejeuner" : 6.9885714285714275, "consoParDiner" : 5.944285714285713, "poidsMoy" : 64.93 }
{ "_id" : "Region parisienne", "nbConso" : 125.07228915662651, "consoParMatin" : 3.4452094090648293, "consoParDejeuner" : 5.98623063683304, "consoParDiner" : 5.974756167527246, "poidsMoy" : 64.8498985801217 }
{ "_id" : "Alsace", "nbConso" : 123.66666666666667, "consoParMatin" : 3.404081632653061, "consoParDejeuner" : 5.944217687074834, "consoParDiner" : 5.514285714285714, "poidsMoy" : 68.82307692307691 }
{ "_id" : "Nord", "nbConso" : 120.78947368421052, "consoParMatin" : 3.448872180451127, "consoParDejeuner" : 5.946616541353384, "consoParDiner" : 5.187218045112782, "poidsMoy" : 67.23068783068783 }
{ "_id" : "Bourgogne", "nbConso" : 119.86206896551724, "consoParMatin" : 3.413793103448275, "consoParDejeuner" : 6.8546798029556655, "consoParDiner" : 5.369458128078819, "poidsMoy" : 68.65438596491228 }
```

// Poids par tranche d'age et par sexe

```javascript
db.Indiv.aggregate( [
   {
     $group : {
        _id : { classe_age: "$tage", label_age: "$age_lab.age_label", sexe: "$sexe_lab.sexe_label" },

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
{ "_id" : { "classe_age" : 2, "label_age" : "11-14", "sexe" : "Feminin" }, "poidsMoy" : 48.04567901234568 }
{ "_id" : { "classe_age" : 2, "label_age" : "11-14", "sexe" : "Masculin" }, "poidsMoy" : 46.9388625592417 }
{ "_id" : { "classe_age" : 3, "label_age" : "15-17", "sexe" : "Feminin" }, "poidsMoy" : 55.92321428571428 }
{ "_id" : { "classe_age" : 3, "label_age" : "15-17", "sexe" : "Masculin" }, "poidsMoy" : 65.57512690355331 }
{ "_id" : { "classe_age" : 4, "label_age" : "18-24", "sexe" : "Feminin" }, "poidsMoy" : 60.58648648648648 }
{ "_id" : { "classe_age" : 4, "label_age" : "18-24", "sexe" : "Masculin" }, "poidsMoy" : 72.93490566037737 }
{ "_id" : { "classe_age" : 5, "label_age" : "25-34", "sexe" : "Feminin" }, "poidsMoy" : 60.94007633587786 }
{ "_id" : { "classe_age" : 5, "label_age" : "25-34", "sexe" : "Masculin" }, "poidsMoy" : 78.06121212121211 }
{ "_id" : { "classe_age" : 6, "label_age" : "35-49", "sexe" : "Feminin" }, "poidsMoy" : 63.23995983935745 }
{ "_id" : { "classe_age" : 6, "label_age" : "35-49", "sexe" : "Masculin" }, "poidsMoy" : 78.7765243902439 }
{ "_id" : { "classe_age" : 7, "label_age" : "50-64", "sexe" : "Feminin" }, "poidsMoy" : 66.98514851485149 }
{ "_id" : { "classe_age" : 7, "label_age" : "50-64", "sexe" : "Masculin" }, "poidsMoy" : 79.26374622356497 }
{ "_id" : { "classe_age" : 8, "label_age" : "65+", "sexe" : "Feminin" }, "poidsMoy" : 66.45794871794872 }
{ "_id" : { "classe_age" : 8, "label_age" : "65+", "sexe" : "Masculin" }, "poidsMoy" : 78.754 }
```

// Ne concerne que les adultes,
// Donne le poids moyen selon la consommation de viande, volaille, poisson et oeufs
// (là encore, des codes)

```javascript
db.Indiv.aggregate( [
   {
       $match: { ech : 1 } 
   },
   {
     $group : {
        _id : { freq_conso_viande: "$fqvpo", freq_conso_viande_lab: "$fqvpo_lab.freq_conso_viande" },
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
{ "_id" : { "freq_conso_viande" : 1, "freq_conso_viande_lab" : "jamais" }, "poidsMoy" : 60.98333333333333 }
{ "_id" : { "freq_conso_viande" : 2, "freq_conso_viande_lab" : "1-2 /sem" }, "poidsMoy" : 69.54666666666667 }
{ "_id" : { "freq_conso_viande" : 3, "freq_conso_viande_lab" : "3-4 /sem" }, "poidsMoy" : 70.57154150197628 }
{ "_id" : { "freq_conso_viande" : 4, "freq_conso_viande_lab" : "5-6 /sem" }, "poidsMoy" : 66.83516483516483 }
{ "_id" : { "freq_conso_viande" : 5, "freq_conso_viande_lab" : "1 /jour" }, "poidsMoy" : 69.34193548387097 }
{ "_id" : { "freq_conso_viande" : 6, "freq_conso_viande_lab" : "2 /jour" }, "poidsMoy" : 71.93162162162162 }
{ "_id" : { "freq_conso_viande" : 7, "freq_conso_viande_lab" : "3 /jour" }, "poidsMoy" : 66.25555555555556 }
{ "_id" : { "freq_conso_viande" : 8, "freq_conso_viande_lab" : "4 /jour" }, "poidsMoy" : 73.55535714285715 }
{ "_id" : { "freq_conso_viande" : 9, "freq_conso_viande_lab" : "ne sait pas" }, "poidsMoy" : 71.25704697986576 }
{ "_id" : { "freq_conso_viande" : 99, "freq_conso_viande_lab" : "pas de réponse" }, "poidsMoy" : 70.905 }

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
{ "_id" : { "revenus" : [ 1 ], "revenus_label" : [ ], "a_eu_des_vacances" : "non" }, "count" : 28 }
{ "_id" : { "revenus" : [ 1 ], "revenus_label" : [ ], "a_eu_des_vacances" : "oui" }, "count" : 34 }
{ "_id" : { "revenus" : [ 2 ], "revenus_label" : [ ], "a_eu_des_vacances" : "non" }, "count" : 51 }
{ "_id" : { "revenus" : [ 2 ], "revenus_label" : [ ], "a_eu_des_vacances" : "oui" }, "count" : 56 }
{ "_id" : { "revenus" : [ 3 ], "revenus_label" : [ ], "a_eu_des_vacances" : "non" }, "count" : 60 }
{ "_id" : { "revenus" : [ 3 ], "revenus_label" : [ ], "a_eu_des_vacances" : "oui" }, "count" : 67 }
{ "_id" : { "revenus" : [ 4 ], "revenus_label" : [ ], "a_eu_des_vacances" : "non" }, "count" : 70 }
{ "_id" : { "revenus" : [ 4 ], "revenus_label" : [ ], "a_eu_des_vacances" : "oui" }, "count" : 67 }
{ "_id" : { "revenus" : [ 5 ], "revenus_label" : [ ], "a_eu_des_vacances" : "non" }, "count" : 48 }
{ "_id" : { "revenus" : [ 5 ], "revenus_label" : [ ], "a_eu_des_vacances" : "oui" }, "count" : 60 }
{ "_id" : { "revenus" : [ 6 ], "revenus_label" : [ ], "a_eu_des_vacances" : "non" }, "count" : 102 }
{ "_id" : { "revenus" : [ 6 ], "revenus_label" : [ ], "a_eu_des_vacances" : "oui" }, "count" : 166 }
{ "_id" : { "revenus" : [ 7 ], "revenus_label" : [ ], "a_eu_des_vacances" : "non" }, "count" : 82 }
{ "_id" : { "revenus" : [ 7 ], "revenus_label" : [ ], "a_eu_des_vacances" : "oui" }, "count" : 136 }
{ "_id" : { "revenus" : [ 8 ], "revenus_label" : [ ], "a_eu_des_vacances" : "non" }, "count" : 55 }
{ "_id" : { "revenus" : [ 8 ], "revenus_label" : [ ], "a_eu_des_vacances" : "oui" }, "count" : 128 }
{ "_id" : { "revenus" : [ 9 ], "revenus_label" : [ ], "a_eu_des_vacances" : "non" }, "count" : 53 }
{ "_id" : { "revenus" : [ 9 ], "revenus_label" : [ ], "a_eu_des_vacances" : "oui" }, "count" : 129 }
{ "_id" : { "revenus" : [ 10 ], "revenus_label" : [ ], "a_eu_des_vacances" : "non" }, "count" : 33 }
{ "_id" : { "revenus" : [ 10 ], "revenus_label" : [ ], "a_eu_des_vacances" : "oui" }, "count" : 138 }
{ "_id" : { "revenus" : [ 11 ], "revenus_label" : [ ], "a_eu_des_vacances" : "non" }, "count" : 43 }
{ "_id" : { "revenus" : [ 11 ], "revenus_label" : [ ], "a_eu_des_vacances" : "oui" }, "count" : 175 }
{ "_id" : { "revenus" : [ 12 ], "revenus_label" : [ ], "a_eu_des_vacances" : "non" }, "count" : 27 }
{ "_id" : { "revenus" : [ 12 ], "revenus_label" : [ ], "a_eu_des_vacances" : "oui" }, "count" : 191 }
{ "_id" : { "revenus" : [ 13 ], "revenus_label" : [ ], "a_eu_des_vacances" : "non" }, "count" : 8 }
{ "_id" : { "revenus" : [ 13 ], "revenus_label" : [ ], "a_eu_des_vacances" : "oui" }, "count" : 105 }
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
