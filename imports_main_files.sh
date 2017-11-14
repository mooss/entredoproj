
mongoimport --type csv --db entredoproj --collection "Indiv" --file Table_indiv.csv --headerline
mongoimport --type csv --db entredoproj --collection "Menage" --file Table_menage_1.csv --headerline
mongoimport --type csv --db entredoproj --collection "Nutrition" --file Table_indnut.csv --headerline

mongoimport --type csv --db entredoproj --collection "Repas" --file repas_monocle.csv --headerline
mongoimport --type csv --db entredoproj --collection "Conso" --file conso_monocle.csv --headerline
mongoimport --type csv --db entredoproj --collection "Nomenclature" --file Nomenclature_3.csv --headerline
