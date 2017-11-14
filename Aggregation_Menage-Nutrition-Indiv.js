db.Indiv_old.drop();

db.Indiv.aggregate([
	{
		$lookup:
		{
            from: "Menage",
            localField: "nomen",
            foreignField: "nomen",
            as: "menage"
		}
	},
	{
		$lookup:
		{
            from: "Nutrition",
            localField: "nomen",
            foreignField: "nomen",
            as: "nutrition"
		}
	},
	{ $out : "Indiv_new" }
])

db.Indiv.renameCollection("Indiv_old");
db.Indiv_new.renameCollection("Indiv");

