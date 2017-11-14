//Ajout de colonnes pour expliciter des codes:
db.Indiv_old.drop();

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
    {
       $lookup:
       {
          from: "Nomen_vacances",
          localField: "vacances",
          foreignField: "vacances",
          as: "vacances_lab"
        }
    },
    { $unwind: "$vacances_lab" },
    { $out : "Indiv_new" }
])

db.Indiv.renameCollection("Indiv_old");
db.Indiv_new.renameCollection("Indiv");

