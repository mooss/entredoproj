db.Conso_old.drop();

db.Conso.aggregate(
     [{$lookup:
          {
            from: "Nomenclature",
            localField: "codal",
            foreignField: "codal",
            as: "code_aliment"
          }},
		{ $unwind : "code_aliment" },
        { $out : "Conso_new" }
])

db.Conso.renameCollection("Conso_old");
db.Conso_new.renameCollection("Conso");
