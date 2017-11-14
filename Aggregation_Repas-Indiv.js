db.Indiv_old.drop();

db.Indiv.aggregate([
	{
		$lookup:
		{
            from: "Repas",
            localField: "nomen",
            foreignField: "nomen",
            as: "repas"
		}
	},
	{ $out : "Indiv_new" }
])

db.Indiv.renameCollection("Indiv_old");
db.Indiv_new.renameCollection("Indiv");


