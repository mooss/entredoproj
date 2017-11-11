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
