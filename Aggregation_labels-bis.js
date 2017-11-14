//Ajout de label(s) pour Menage

db.Menage_old.drop();

db.Menage.aggregate([
    {
       $lookup:
       {
          from: "Nomen_revenu",
          localField: "revenu",
          foreignField: "revenu",
          as: "revenu_lab"
        }
    },
    { $unwind: "$revenu_lab" },
    { $out : "Menage_new" }
]);

db.Menage.renameCollection("Menage_old");
db.Menage_new.renameCollection("Menage");
