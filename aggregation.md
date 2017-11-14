Après avoir nettoyer nos données csv et avoir ajouter l'identifiant nomen_nojour_tyrep aux fichiers Table_conso.csv et Table_repas.csv, il nous suffit d'aggréger nos données.
Nous procédons tout d'abord par l'agrégation de la collection Conso dans la collection Repas.

     db.getCollection('Repas').aggregate(
     [{$lookup:
          {
            from: "Conso",
            localField: "nomen_nojour_tyrep",
            foreignField: "nomen_nojour_tyrep",
            as: "conso"
          }},
        { $out : "newCollection" }
        ])

On peut désormais supprimer les collections Conso et Repas, et renommer la collection obtenue en "Repas".
 
Ensuite, nous pouvons agréger la collection Repas dans la collection Indiv.
 
     db.getCollection('Indiv').aggregate(
     [{
         $lookup : {
             from : "Repas",
             localField: "nomen",
             foreignField: "nomen",
             as : "repas"
         }},
         { $out : "newCollection" }
     ])

De la même façon, on peut supprimer toutes les autres tables et renommer la nouvelle table en Indiv.

//procéder à l'agrégation avec les autres collections


//Ajout de colonnes pour expliciter des codes:
//Explicite fume, ech (enfant/adulte), sexe, region et age (tranches d'age, pour être plus exacte)
//manque l'aggrégation Nomen_revenu, car revenu est dans Menage et c'est casse-couilles

db.Indiv.aggregate([
    {
       $lookup:
       {
          from: "Nomen_fume",
          localField: "fume",
          foreignField: "fume",
          as: "fume_lab"
        }
    },
    { $unwind: "$fume_lab" },
    {
       $lookup:
       {
          from: "Nomen_ech",
          localField: "ech",
          foreignField: "ech",
          as: "ech_lab"
        }
    },
    { $unwind: "$ech_lab" },
    {
       $lookup:
       {
          from: "Nomen_sexe",
          localField: "sexe_ps",
          foreignField: "sexe_ps",
          as: "sexe_lab"
        }
    },
    { $unwind: "$sexe_lab" },
    {
       $lookup:
       {
          from: "Nomen_region",
          localField: "region",
          foreignField: "region",
          as: "region_lab"
        }
    },
    { $unwind: "$region_lab" },
    {
       $lookup:
       {
          from: "Nomen_age",
          localField: "tage",
          foreignField: "tage",
          as: "age_lab"
        }
    },
    { $unwind: "$age_lab" },
    { $out : "Indiv2" }
])

