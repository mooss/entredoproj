Voici les étapes de prétraitement de notre entrepot :

1- Téléchargement des 9 fichiers .csv

2- Remplacement des , par des ; et inversement

3- (*1) Modification des tables Conso et Repas pour leur ajouter une clé commune

4- Insertion des 6 fichiers .csv qui nous intéressent via mongoimport, ainsi que de tous les fichiers nomen_*.csv fabriqués manuellement

5- (*2) Agrégation des nomen_*.csv dans les collections autres que Indiv

6- Agrégation de Nomenclature dans Conso

7- Agrégation de Menage, Indnut, Repas et Conso dans Indiv

8- Agrégation des nomen_*.csv restant

(*1): Il s'agissait de faire ensuite quelque chose qu'on ne fera finalement pas, par contraintes techniques. Mais on garde quand même, ça peut toujours servir !
(*2): J'aimerai que ça puisse être fait en dernier, avec le 8-, mais faut alors faire un $unwind et tout ça... pour l'instant, je ne sais pas trop faire


4-
./imports_main_files.sh
./imports_nomen_files.sh


//A partir de là, tout dans mongo :

5-

load("Aggregation_labels-bis.js")

6- 

load("Aggregation_Nomen-Conso.js")

7-
//D'abord Menage et Nutrition dans Indiv
load("Aggregation_Menage-Nutrition-Indiv.js")

//Ensuite, Repas dans Indiv
load("Aggregation_Repas-Indiv.js")

//Enfin, Conso dans Indiv
load("Aggregation_Conso-Indiv.js")

8-
//Ajout de tous les labels
load("Aggregation_labels.js")
