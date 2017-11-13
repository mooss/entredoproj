Les requêtes présentées ci-dessous apportent des éléments d'analyse basés sur les données de l'étude INCA2. 

Une première requête consiste à obtenir les aliments les plus consommés par région.

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
    
Durant cette agrégation, nous nous sommes retrouvés confrontés au fait que nos données contenaient un produit "x" catégorisant des produits dont le nom commercial n'a pas été fourni. Autrement dit, la plupart des consommations n'ont pas de nom. Nous avons donc décidé de filtrer ce produit non pertinent et d'effectuer l'analyse sur le reste des produits.

Voici le résultat de la requête :

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

Remarque : "_id" correspond au numéro de la région.

Il s'est avéré que les résultats n'étaient pas si intéressants étant donné qu'ils rendent principalement compte de la consommation de lait et de chocolat chaud.



// Pour chaque région, donne la moyenne du nombre de consommations par habitant
//  puis trie dans l'ordre décroissant
// Il faudra ajouter le nom des régions

db.Indiv_complete.aggregate( [
   {
     $group : {
        _id : "$region",
        nbConso: { $avg: { $size:"$conso" } }
     }
   },
   {
     $sort: { "nbConso": -1 }
   }
] )



