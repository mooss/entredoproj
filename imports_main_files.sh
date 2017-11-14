
mongoimport --type csv --collection "Indiv" --file Table_indiv.csv --headerline
mongoimport --type csv --collection "Menage" --file Table_menage_1.csv --headerline
mongoimport --type csv --collection "Nutrition" --file Table_indnut.csv --headerline

mongoimport --type csv --collection "Repas" --file repas_monocle.csv --headerline
mongoimport --type csv --collection "Conso" --file conso_monocle.csv --headerline
mongoimport --type csv --collection "Nomenclature" --file Nomenclature_3.csv --headerline

