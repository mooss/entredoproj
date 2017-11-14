db.Indiv_old.drop();

db.Indiv.aggregate([
	{
		$lookup:
		{
            from: "Conso",
            localField: "nomen",
            foreignField: "nomen",
            as: "conso"
		}
	},
	{ $out : "Indiv_new" }
])

db.Indiv.renameCollection("Indiv_old");
db.Indiv_new.renameCollection("Indiv");


