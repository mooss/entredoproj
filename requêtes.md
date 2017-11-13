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

Résultat:
{ "_id" : 12, "nbConso" : 143.50222222222223 }
{ "_id" : 6, "nbConso" : 142.6985294117647 }
{ "_id" : 16, "nbConso" : 141.8562091503268 }
{ "_id" : 17, "nbConso" : 140.72727272727272 }
{ "_id" : 14, "nbConso" : 140.52439024390245 }
{ "_id" : 13, "nbConso" : 139.02727272727273 }
{ "_id" : 15, "nbConso" : 135.50409836065575 }
{ "_id" : 18, "nbConso" : 135.2478134110787 }
{ "_id" : 21, "nbConso" : 133.62995594713655 }
{ "_id" : 3, "nbConso" : 133.32432432432432 }
{ "_id" : 20, "nbConso" : 133.16141732283464 }
{ "_id" : 11, "nbConso" : 132.9770992366412 }
{ "_id" : 9, "nbConso" : 132.94329896907217 }
{ "_id" : 4, "nbConso" : 132.5530303030303 }
{ "_id" : 19, "nbConso" : 132.32478632478632 }
{ "_id" : 5, "nbConso" : 132.15270935960592 }
{ "_id" : 2, "nbConso" : 130.35658914728683 }
{ "_id" : 1, "nbConso" : 125.51747088186356 }
{ "_id" : 7, "nbConso" : 123.38235294117646 }
{ "_id" : 10, "nbConso" : 122.36974789915966 }
{ "_id" : 8, "nbConso" : 117.79735682819383 }


//En plus de donner, comme la précédente, le nombre moyen de conso par région,
// donne le nombre moyen de conso au petit déjeuner, déjeuner et diner.
// Note : le second terme de divide est le nombre de jours (dans la semaine)

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

//Voilà les résultat.
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
