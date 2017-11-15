# Rapport de projet de Base de Données Évoluée

*par MÉNARD Mica, WIBAUX Robin & JAMET Félix*

## Résumé

Dans le cadre du cours *Base de Données Évoluées*, nous avons réalisé une analyse NOSQL du dataset INCA2 (expliqué plus bas) qui rassemble des données sur les habitudes de consommations d'individus vivant en France. Notre analyse vise à mettre en évidence des relations entre nos différentes données sous forme d'aggrégats.

## Choix de l'Entrepôt

Pour ce projet, la base de données que nous avons choisi est le résultat d’une étude réalisée par l’ANSES (l’Agence nationale de sécurité sanitaire de l’alimentation, de l’environnement et du travail). L’étude en question, l’étude INCA, vise à mieux les habitudes et les consommations alimentaires des français.
Elle a été réalisé à trois reprises pour donner INCA1 (1998-1999), INCA2 (2006-2007) et INCA3 (2014-2015). Pour notre projet, nous avons pris les données de l’étude INCA2. Ce choix était tout à fait arbitraire, il s’agissait de la première des trois sur laquelle nous étions tombés.

L’étude INCA2 nous fournit ainsi dix documents, dont une notice d’utilisation en PDF. Les neuf autres sont les documents en format csv contenant l’ensemble des données. Elles peuvent êtres rangées dans trois catégories :
- Les informations et questions posées aux individus : **Indiv**, **Menages** et **Indnut**

→ La table **Indiv** concerne certaines informations et questions générales posées à l’individu : sa tranche d’age, son sexe, sa région, certaines habitudes alimentaires, s’il fume ou s’il suit un régimes… elle compte près de 130 colonnes.

→ La table **Menages** concerne des informations plus proches de son foyer : ses revenus, sa catégorie socio-professionnelle, le nombre de voitures et de télévisions du foyer…

→ La table **Indnut** donne les apports nutritifs journaliers moyen de l’individu en Fer, Vitamines, Calcium…
Ces trois tables ont pour seul clé le numéro de l’individu.

- Les informations concernant l’alimentation des individu : Repas, Conso et Nomenclature
Les deux premières tables ont un fonctionnement particulier. L’individu concerné a dû remplir un carnet (ou deux) pendant sept jours, où il notait (par ordre de groupe à sous-groupe) le numéro du jour (avec le nom du jour de la semaine), le type de repas (petit déjeuner, dîner, collation du soir…) et l’aliment consommé (considéré dans la table comme le numéro de la ligne).

→ La table **Repas** a pour clé le numéro de l’individu, le numéro du jour et le type de repas. Cette table ne concerne pas les aliments consommé, mais contient plutôt le contexte des repas, s’il a mangé dehors, en famille…

→ La table **Conso** a pour clé le numéro de l’individu et le numéro de la ligne. Elle possède aussi comme informations le numéro du jour et le type de repas, mais concerne surtout les détails de l’aliment consommé, viande ou légume, cuisson… Il y a donc une ligne par aliment consommé par repas.

→ La table **Nomenclature**, enfin, concerne les codes utilisés dans Conso. Un aliment a un groupe, un sous-groupe et un identifiant (nomme codal pour code aliment). Ces codes ne sont présent dans Conso qu’en version numérique, cette table permet donc d’avoir les libellés correspondant.
La clé de cette dernière table est ainsi : codal.

- Les informations concernant les compléments alimentaires pris par les individus : **Indiv_CA**, **CAPI_CA** et **Carnet_CA**.
Nous ne nous intéresserons pas à ces trois dernières tables, notre entrepôt étant déjà bien assez rempli jusqu’ici.

Concernant le poids de notre entrepôt :
4079 individus ont participé à l’étude. Les trois premières tables présentées ont donc autant de lignes.
Chaque individu a pris en moyenne environs 40 repas et 125 aliments, ce qui donne pour les tables Repas et Conso respectivement 170.000 lignes et 500.000 lignes.
Il y a enfin 1343 codal d’aliments différents, pour la taille de Nomenclature.

## Choix du Langage

Nous avons choisi de travailler avec la technologie NoSQL. Ce choix s'est effectué de manière plutôt arbitraire. En effet, du fait de la complexité d'accès à Oracle et de notre curiosité particulière pour NoSQL (que nous n'avions jamais abordé en cours), nous nous sommes tournés vers MongoDB qui est une des technologies NoSQL permettant d'effectuer des agrégations efficacement. Ces agrégations sont d'autant plus pertinentes pour notre dataset, qui permet d'effectuer des analyses (corrélation, etc.) entre différents faits.

## Prétraitements Réalisés

### 1- Téléchargement des 9 fichiers .csv

  Table_carnet_ca_1.csv
  Table_conso.csv
  Table_indiv_ca.csv
  Table_indiv.csv
  Table_indnut.csv
  Table_menage_1.csv
  Table_repas.csv
  Nomenclature_3.csv               
  Table_capi_ca.csv

### 2- Remplacement des , par des ; et inversement

Notre dataset INCA2 a été construit de sorte à faciliter les analyses ultérieures. Des problèmes mineurs se sont néanmoins présentés dans la forme des données.

Il se trouve que le format standard de séparateur des fichiers CSV est la virgule ",". Nos CSV comportaient cependant des point-virgules ";" comme séparateur.

Normalement, il est possible de configurer le séparateur dans la plupart des programmes. Néanmoins, mongoimport (l'outil de mongoDB permettant d'important des fichiers CSV, TSV ou JSON) n'offre pas cette option.

Nous avons donc dû remplacer les ";" par des ",". Avant de procéder, nous avons toutefois transformé les "," en "\*" pour la simple et bonne raison que tous les champs de type texte de nos fichiers CSV n'étaient pas séparés par des guillemets. Nous avons donc effectué les commandes suivantes :

```bash
sed 's/,/\*/g' *.csv > *.csv
```

```bash
sed 's/;/,/g' *.csv > *.csv
```

### 3- Modification des tables Conso et Repas pour leur ajouter une clé commune

Comme expliqué dans le fichier [useful_commands.md](https://github.com/mooss/entredoproj/edit/master/useful_commands.md), nous avons procédé aux processus suivants :

#### Transformer un fichier CRLF en fichier LF

```bash
perl -pi -e 's/\r\n/\n/g' input.file
```

#### Ajouter la colonne nomen\_nojour\_tyrep dans repas

Étant donné que nous voulions agréger la collection Conso dans la collection Repas, il nous a fallu ajouter une clé commune "nomen\_nojour\_tyrep" dans les deux collections. Cette clé permet de réunir tous les types de repas (**tyrep**), classé par jour (de lundi à dimanche), puis par individu. Voici le code bash permettant d'ajouter cette clé aux fichiers CSV :

```bash
# d'abord, on cut les colonnes desirees vers un fichier
cut -d , -f "1,2,4" --output-delimiter=_ Table_repas.csv > last_column
# ensuite on les paste a la table originale vers la destination
paste -d ,  Table_repas.csv last_column > repas_monocle.csv
```
L'opération est similaire pour la table conso.

### 4- Insertion des 9 fichiers .csv via mongoimport, ainsi que de tous les fichiers nomen_.csv fabriqués manuellement

L'importation de fichiers CSV dans mongoDB se réalise avec le programme mongoimport de la façon suivante (décrite dans les fichiers [import_main_files.sh](https://github.com/mooss/entredoproj/blob/master/imports_main_files.sh) et [imports_nomen_files.sh](https://github.com/mooss/entredoproj/blob/master/imports_nomen_files.sh) :

```bash
//importation des tables principales
mongoimport --type csv --db entredoproj --collection "Indiv" --file Table_indiv.csv --headerline
mongoimport --type csv --db entredoproj --collection "Menage" --file Table_menage_1.csv --headerline
mongoimport --type csv --db entredoproj --collection "Nutrition" --file Table_indnut.csv --headerline
mongoimport --type csv --db entredoproj --collection "Repas" --file repas_monocle.csv --headerline
mongoimport --type csv --db entredoproj --collection "Conso" --file conso_monocle.csv --headerline
mongoimport --type csv --db entredoproj --collection "Nomenclature" --file Nomenclature_3.csv --headerline

//importation des tables de nomenclature
mongoimport --type csv --db entredoproj --collection "Nomen_age" --file Nomen_age.csv --headerline
mongoimport --type csv --db entredoproj --collection "Nomen_ech" --file Nomen_ech.csv --headerline
mongoimport --type csv --db entredoproj --collection "Nomen_fume" --file Nomen_fume.csv --headerline
mongoimport --type csv --db entredoproj --collection "Nomen_region" --file Nomen_region.csv --headerline
mongoimport --type csv --db entredoproj --collection "Nomen_revenu" --file Nomen_revenu.csv --headerline
mongoimport --type csv --db entredoproj --collection "Nomen_sexe" --file Nomen_sexe.csv --headerline
mongoimport --type csv --db entredoproj --collection "Nomen_vacances" --file Nomen_vacances.csv --headerline
mongoimport --type csv --db entredoproj --collection "Nomen_fqvpo" --file Nomen_fqvpo.csv --headerline
```
### 5- Agrégation des nomen_.csv dans les collections autres que Indiv

La première étape de notre agrégation consiste à agréger les nomenclatures concernant les ménages avec la collection Menage (exécution dans la console mongo de [Aggregation_labels-bis.js](https://github.com/mooss/entredoproj/blob/master/Aggregation_labels-bis.js)).
```javascript
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
```

### 6- Agrégation de Nomenclature dans Conso

Notre procédons à la même chose pour la table Conso (exécution dans la console mongo de [Aggregation_Nomen-Conso.js](https://github.com/mooss/entredoproj/blob/master/Aggregation_Nomen-Conso.js)).

```javascript
db.Conso_old.drop();

db.Conso.aggregate(
     [{$lookup:
          {
            from: "Nomenclature",
            localField: "codal",
            foreignField: "codal",
            as: "code_aliment"
          }},
		{ $unwind : "$code_aliment" },
        { $out : "Conso_new" }
])

db.Conso.renameCollection("Conso_old");
db.Conso_new.renameCollection("Conso");
```

### 7- Agrégation de Menage, Indnut, Repas et Conso dans Indiv

Nous agrégons par la suite les tables Menage et Indnut (nutrition) dans Indiv.
```javascript
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
```

Puis Repas dans Indiv.
```javascript
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
```

Et finalement Conso dans Indiv.

```javascript
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
```

### 8- Agrégation des nomen_.csv restant

La dernière étape de notre agrégation consiste à agréger les nomenclatures restantes.
```javascript
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
    { $out : "Indiv_new" }
])

db.Indiv.renameCollection("Indiv_old");
db.Indiv_new.renameCollection("Indiv");
```

### Choix du Schéma

La première version de notre schéma consistait à agréger toutes les collections vers la collection Indiv et notamment d'agréger Conso dans Repas.

![Diagramme 1](https://github.com/mooss/entredoproj/blob/master/diagramme1.png)

Cette configuration est en théorie possible. Nous nous sommes cependant trouvés confrontés à un problème d'implémentation. En effet, la table Conso contient ~500 000 kignes et la table Repas ~170 000. La requête agrégeant ces deux collections aurait alors effectué ~85 000 000 000 d'opérations. Nous n'avons donc malheureusement pas pu effectuer cette opération.

Nous avons de ce fait, en dépit de la pertinence de notre analyse, décidé de laisser Conso et Repas séparés. Voici la configuration finale :

![Diagramme 2](https://github.com/mooss/entredoproj/blob/master/diagramme2.png)


### Réalisation des Requêtes

Les requêtes présentées ci-dessous apportent des éléments d'analyse basés sur les données de l'étude INCA2. 

Une première requête consiste à obtenir les aliments les plus consommés par région.

```javascript
db.Indiv.aggregate(
    {$unwind: '$conso'},
    {$group: {_id: {conso:'$conso.code_aliment.libal', region:"$region_lab.region_label"}, sum: {$sum: 1}}},
    {$sort : {sum : -1}},
    {$group: {
    _id: "$_id.region",
    "conso": {
        $first: "$_id.conso"
    },
    "sum": {
        $first: "$sum"
    },
}},
{$sort : {_id : 1}});
```

Voici le résultat de la requête :
```json
{ "_id" : "Alsace", "conso" : [ "eau du robinet" ], "sum" : 598 }
{ "_id" : "Aquitaine", "conso" : [ "eau du robinet" ], "sum" : 2174 }
{ "_id" : "Auvergne", "conso" : [ "eau du robinet" ], "sum" : 751 }
{ "_id" : "Basse-Normandie", "conso" : [ "caf� noir pr�t � boire non sucr�" ], "sum" : 778 }
{ "_id" : "Bourgogne", "conso" : [ "pain baguette" ], "sum" : 454 }
{ "_id" : "Bretagne", "conso" : [ "caf� noir pr�t � boire non sucr�" ], "sum" : 1432 }
{ "_id" : "Centre", "conso" : [ "eau du robinet" ], "sum" : 1229 }
{ "_id" : "Champagne", "conso" : [ "pain baguette" ], "sum" : 801 }
{ "_id" : "Franche Compte", "conso" : [ "eau du robinet" ], "sum" : 1050 }
{ "_id" : "Haute-Normandie", "conso" : [ "pain baguette" ], "sum" : 691 }
{ "_id" : "Languedoc", "conso" : [ "eau du robinet" ], "sum" : 2134 }
{ "_id" : "Limousin", "conso" : [ "eau du robinet" ], "sum" : 381 }
{ "_id" : "Lorraine", "conso" : [ "eau du robinet" ], "sum" : 1262 }
{ "_id" : "Midi-Pyrenees", "conso" : [ "eau du robinet" ], "sum" : 1275 }
{ "_id" : "Nord", "conso" : [ "eau de source" ], "sum" : 976 }
{ "_id" : "Pays De Loire", "conso" : [ "eau du robinet" ], "sum" : 1326 }
{ "_id" : "Picardie", "conso" : [ "pain baguette" ], "sum" : 752 }
{ "_id" : "Poitou Charentes", "conso" : [ "eau du robinet" ], "sum" : 1136 }
{ "_id" : "Provence Cote D'azur", "conso" : [ "eau du robinet" ], "sum" : 1754 }
{ "_id" : "Region parisienne", "conso" : [ "eau du robinet" ], "sum" : 3111 }
{ "_id" : "Rhone-Alpes", "conso" : [ "eau du robinet" ], "sum" : 3366 }
```
De manière similaire, la requête suivante regroupe les produits les plus consommés par les différentes classes d'âge étudiées.

```javascript
db.Indiv.aggregate(
    {$unwind: '$conso'},
    {$group: {_id: {conso:'$conso.code_aliment.libal', classe_age:"$age_lab.age_label"}, sum: {$sum: 1}}},
    {$sort : {sum : -1}},
    {$group: {
    _id: "$_id.classe_age",
    "conso": {
        $first: "$_id.conso"
    },
    "sum": {
        $first: "$sum"
    },
}},
{$sort : {"_id.classe_age" : 1}});
```
 Résultat :
```json
{ "_id" : "15-17", "conso" : [ "eau du robinet" ], "sum" : 2881 }
{ "_id" : "25-34", "conso" : [ "eau du robinet" ], "sum" : 2972 }
{ "_id" : "50-64", "conso" : [ "caf� noir pr�t � boire non sucr�" ], "sum" : 5766 }
{ "_id" : "11-14", "conso" : [ "eau du robinet" ], "sum" : 3116 }
{ "_id" : "18-24", "conso" : [ "eau du robinet" ], "sum" : 1600 }
{ "_id" : "35-49", "conso" : [ "caf� noir pr�t � boire non sucr�" ], "sum" : 6557 }
{ "_id" : "65+", "conso" : [ "pain baguette" ], "sum" : 3029 }
```

Similaire aux précédentes, la requête suivante a été modifiée pour obtenir l'élément le plus consommé par tranche de revenu (15 au total).

```javascript
db.Indiv.aggregate(
    {$unwind: '$menage'},
    {$unwind: '$conso'},
    {$group: {_id: {revenu: "$menage.revenu", revenus_label: "$menage.revenu_lab.revenu.label", conso:"$conso.code_aliment.libal"}, sum: {$sum: 1}}},
    {$sort : {sum : -1}},
    {$group: {
    _id: "$_id.revenu",
    "conso": {
        $first: "$_id.conso"
    },
    "sum": {
        $first: "$sum"
    },
}},
{$sort : {"_id.revenus_label" : 1}});
```

Ce qui nous donne :

```json
{ "_id" : 2, "conso" : [ "eau du robinet" ], "sum" : 815 }
{ "_id" : 1, "conso" : [ "eau du robinet" ], "sum" : 449 }
{ "_id" : 3, "conso" : [ "eau du robinet" ], "sum" : 1145 }
{ "_id" : 5, "conso" : [ "eau du robinet" ], "sum" : 1192 }
{ "_id" : 13, "conso" : [ "eau du robinet" ], "sum" : 1376 }
{ "_id" : 9, "conso" : [ "eau du robinet" ], "sum" : 1756 }
{ "_id" : 11, "conso" : [ "eau du robinet" ], "sum" : 2390 }
{ "_id" : 10, "conso" : [ "eau du robinet" ], "sum" : 1963 }
{ "_id" : 15, "conso" : [ "pain baguette" ], "sum" : 2790 }
{ "_id" : 8, "conso" : [ "eau du robinet" ], "sum" : 1873 }
{ "_id" : 6, "conso" : [ "eau du robinet" ], "sum" : 2498 }
{ "_id" : 12, "conso" : [ "eau du robinet" ], "sum" : 2569 }
{ "_id" : 7, "conso" : [ "eau du robinet" ], "sum" : 1933 }
{ "_id" : 14, "conso" : [ "eau du robinet" ], "sum" : 1505 }
{ "_id" : 4, "conso" : [ "eau du robinet" ], "sum" : 1468 }
```

Encore une fois, nos données ne fournissent pas de résultat intéressant. En effet, la plupart des noms de produit n'ont pas malheureusement pas été fournis.



- Pour chaque région, donne la moyenne du nombre de consommations par habitant, puis trie dans l'ordre décroissant.
Donne aussi le nombre moyen de conso au petit déjeuner, déjeuner et diner.
On ajoute en plus le poids moyen des individus en kg.

```javascript
db.Indiv.aggregate( [
   {
     $group : {
        _id : "$region_lab.region_label",
        nbConso: { $avg: { $size:"$conso" } },

        consoParMatin: { $avg: {  $divide: [ 
            {$size: { $filter: { 
                input:"$conso", 
                as:"cons", 
                cond:
                {$eq: ["$$cons.tyrep",1]}
                } } },
            7 ] } },
        consoParDejeuner: { $avg: { $divide: [ 
            {$size: { $filter: { 
                input:"$conso", 
                as:"cons", 
                cond:
                {$eq: ["$$cons.tyrep",3]}
                } } },
            7 ] } },
        consoParDiner: { $avg: { $divide: [ 
            {$size: { $filter: { 
                input:"$conso", 
                as:"cons", 
                cond:
                {$eq: ["$$cons.tyrep",5]}
                } } },
            7 ] } },

        poidsMoy: { $avg: "$poids" }
     }
   },
   {
     $sort: { "nbConso": -1 }
   }
] )
```
Remarques:
Réduire les décimales à deux après la virgule serait appréciable.
Aussi, l'absence totale de corrélation entre le nombre de consommations et le poids moyen n'a rien d'étonnant. Le nombre de consommations correspond en réalité au nombre d'aliments distincts consommés par repas (cela comprends l'eau en bouteille !). Ces chiffres sont donc d'avantage révélateurs de diversité culinaire que de quantité consommée.

```json
{ "_id" : "Pays De Loire", "nbConso" : 145.47340425531914, "consoParMatin" : 4.053191489361703, "consoParDejeuner" : 7.54635258358663, "consoParDiner" : 6.502279635258357, "poidsMoy" : 64.57043010752689 }
{ "_id" : "Basse-Normandie", "nbConso" : 145.10434782608695, "consoParMatin" : 3.6645962732919255, "consoParDejeuner" : 7.50062111801242, "consoParDiner" : 6.860869565217392, "poidsMoy" : 68.11769911504425 }
{ "_id" : "Midi-Pyrenees", "nbConso" : 143.33333333333334, "consoParMatin" : 3.570321151716501, "consoParDejeuner" : 7.679955703211517, "consoParDiner" : 6.5570321151716495, "poidsMoy" : 64.53464566929134 }
{ "_id" : "Poitou Charentes", "nbConso" : 141.46323529411765, "consoParMatin" : 3.837184873949579, "consoParDejeuner" : 7.382352941176469, "consoParDiner" : 6.436974789915965, "poidsMoy" : 64.4888888888889 }
{ "_id" : "Bretagne", "nbConso" : 141.23711340206185, "consoParMatin" : 3.9329896907216484, "consoParDejeuner" : 7.221649484536082, "consoParDiner" : 6.32989690721649, "poidsMoy" : 64.58911917098445 }
{ "_id" : "Limousin", "nbConso" : 140.29268292682926, "consoParMatin" : 3.623693379790941, "consoParDejeuner" : 7.261324041811846, "consoParDiner" : 6.477351916376305, "poidsMoy" : 69.18780487804878 }
{ "_id" : "Aquitaine", "nbConso" : 137.49763033175356, "consoParMatin" : 3.6655382532159813, "consoParDejeuner" : 7.229519295870006, "consoParDiner" : 6.33446174678402, "poidsMoy" : 65.99004739336495 }
{ "_id" : "Rhone-Alpes", "nbConso" : 136.98006644518273, "consoParMatin" : 3.37921214997627, "consoParDejeuner" : 7.2135738016136735, "consoParDiner" : 6.120550545799719, "poidsMoy" : 64.8258389261745 }
{ "_id" : "Haute-Normandie", "nbConso" : 136.38181818181818, "consoParMatin" : 3.500000000000001, "consoParDejeuner" : 6.693506493506496, "consoParDiner" : 6.62987012987013, "poidsMoy" : 66.2411214953271 }
{ "_id" : "Provence Cote D'azur", "nbConso" : 135.7195767195767, "consoParMatin" : 3.674225245653819, "consoParDejeuner" : 6.960695389266818, "consoParDiner" : 6.273620559334843, "poidsMoy" : 66.38010752688173 }
{ "_id" : "Lorraine", "nbConso" : 135.5688622754491, "consoParMatin" : 3.7159965782720272, "consoParDejeuner" : 6.834046193327631, "consoParDiner" : 5.822925577416597, "poidsMoy" : 65.72814371257485 }
{ "_id" : "Franche Compte", "nbConso" : 134.72321428571428, "consoParMatin" : 3.65561224489796, "consoParDejeuner" : 7.103316326530612, "consoParDiner" : 6.024234693877553, "poidsMoy" : 65.62363636363636 }
{ "_id" : "Picardie", "nbConso" : 134.28571428571428, "consoParMatin" : 3.382086167800455, "consoParDejeuner" : 6.591836734693882, "consoParDiner" : 6.395691609977325, "poidsMoy" : 68.67936507936508 }
{ "_id" : "Languedoc", "nbConso" : 133.5450643776824, "consoParMatin" : 3.320049049662784, "consoParDejeuner" : 6.91048436541999, "consoParDiner" : 6.215818516247703, "poidsMoy" : 64.99 }
{ "_id" : "Champagne", "nbConso" : 132.96296296296296, "consoParMatin" : 3.649470899470901, "consoParDejeuner" : 7.01984126984127, "consoParDiner" : 5.97883597883598, "poidsMoy" : 66.69158878504673 }
{ "_id" : "Centre", "nbConso" : 132.4808743169399, "consoParMatin" : 3.4543325526932094, "consoParDejeuner" : 7.04683840749414, "consoParDiner" : 6.107728337236535, "poidsMoy" : 67.08406593406595 }
{ "_id" : "Auvergne", "nbConso" : 130.76, "consoParMatin" : 3.350000000000001, "consoParDejeuner" : 6.9885714285714275, "consoParDiner" : 5.944285714285713, "poidsMoy" : 64.93 }
{ "_id" : "Region parisienne", "nbConso" : 125.07228915662651, "consoParMatin" : 3.4452094090648293, "consoParDejeuner" : 5.98623063683304, "consoParDiner" : 5.974756167527246, "poidsMoy" : 64.8498985801217 }
{ "_id" : "Alsace", "nbConso" : 123.66666666666667, "consoParMatin" : 3.404081632653061, "consoParDejeuner" : 5.944217687074834, "consoParDiner" : 5.514285714285714, "poidsMoy" : 68.82307692307691 }
{ "_id" : "Nord", "nbConso" : 120.78947368421052, "consoParMatin" : 3.448872180451127, "consoParDejeuner" : 5.946616541353384, "consoParDiner" : 5.187218045112782, "poidsMoy" : 67.23068783068783 }
{ "_id" : "Bourgogne", "nbConso" : 119.86206896551724, "consoParMatin" : 3.413793103448275, "consoParDejeuner" : 6.8546798029556655, "consoParDiner" : 5.369458128078819, "poidsMoy" : 68.65438596491228 }
```

- Poids par tranche d'age et par sexe

```javascript
db.Indiv.aggregate( [
   {
     $group : {
        _id : { classe_age: "$tage", label_age: "$age_lab.age_label", sexe: "$sexe_lab.sexe_label" },

        poidsMoy: { $avg: "$poids" }
     }
   },
   {
     $sort: { "_id": 1 }
   }
] )
```

Remarques:
Il manque la classe d'age 1.
Les hommes sont en moyenne plus lours que les femmes (ça n'est pas une surprise).
Passé l'age adulte (18 ans), les poids sont très constants.

```json
{ "_id" : { "classe_age" : 2, "label_age" : "11-14", "sexe" : "Feminin" }, "poidsMoy" : 48.04567901234568 }
{ "_id" : { "classe_age" : 2, "label_age" : "11-14", "sexe" : "Masculin" }, "poidsMoy" : 46.9388625592417 }
{ "_id" : { "classe_age" : 3, "label_age" : "15-17", "sexe" : "Feminin" }, "poidsMoy" : 55.92321428571428 }
{ "_id" : { "classe_age" : 3, "label_age" : "15-17", "sexe" : "Masculin" }, "poidsMoy" : 65.57512690355331 }
{ "_id" : { "classe_age" : 4, "label_age" : "18-24", "sexe" : "Feminin" }, "poidsMoy" : 60.58648648648648 }
{ "_id" : { "classe_age" : 4, "label_age" : "18-24", "sexe" : "Masculin" }, "poidsMoy" : 72.93490566037737 }
{ "_id" : { "classe_age" : 5, "label_age" : "25-34", "sexe" : "Feminin" }, "poidsMoy" : 60.94007633587786 }
{ "_id" : { "classe_age" : 5, "label_age" : "25-34", "sexe" : "Masculin" }, "poidsMoy" : 78.06121212121211 }
{ "_id" : { "classe_age" : 6, "label_age" : "35-49", "sexe" : "Feminin" }, "poidsMoy" : 63.23995983935745 }
{ "_id" : { "classe_age" : 6, "label_age" : "35-49", "sexe" : "Masculin" }, "poidsMoy" : 78.7765243902439 }
{ "_id" : { "classe_age" : 7, "label_age" : "50-64", "sexe" : "Feminin" }, "poidsMoy" : 66.98514851485149 }
{ "_id" : { "classe_age" : 7, "label_age" : "50-64", "sexe" : "Masculin" }, "poidsMoy" : 79.26374622356497 }
{ "_id" : { "classe_age" : 8, "label_age" : "65+", "sexe" : "Feminin" }, "poidsMoy" : 66.45794871794872 }
{ "_id" : { "classe_age" : 8, "label_age" : "65+", "sexe" : "Masculin" }, "poidsMoy" : 78.754 }
```

- Ne concerne que les adultes,
Donne le poids moyen selon la consommation de viande, volaille, poisson et oeufs.

```javascript
db.Indiv.aggregate( [
   {
       $match: { ech : 1 } 
   },
   {
     $group : {
        _id : { freq_conso_viande: "$fqvpo", freq_conso_viande_lab: "$fqvpo_lab.freq_conso_viande" },
        poidsMoy: { $avg: "$poids" }
     }
   },
   {
     $sort: { "_id": 1 }
   }
] )
```

Remarques:
Bien que le label ne parle que de viande, la notice précise qu'il s'agit de viande, volaille, oeufs et poisson. Légère imprécision de notre part.
Les individus ne consommant jamais de "viande" se démarquent par leur faible poids.
Pour ce qui est des autres, les résultats sont assez constants.

```json
{ "_id" : { "freq_conso_viande" : 1, "freq_conso_viande_lab" : "jamais" }, "poidsMoy" : 60.98333333333333 }
{ "_id" : { "freq_conso_viande" : 2, "freq_conso_viande_lab" : "1-2 /sem" }, "poidsMoy" : 69.54666666666667 }
{ "_id" : { "freq_conso_viande" : 3, "freq_conso_viande_lab" : "3-4 /sem" }, "poidsMoy" : 70.57154150197628 }
{ "_id" : { "freq_conso_viande" : 4, "freq_conso_viande_lab" : "5-6 /sem" }, "poidsMoy" : 66.83516483516483 }
{ "_id" : { "freq_conso_viande" : 5, "freq_conso_viande_lab" : "1 /jour" }, "poidsMoy" : 69.34193548387097 }
{ "_id" : { "freq_conso_viande" : 6, "freq_conso_viande_lab" : "2 /jour" }, "poidsMoy" : 71.93162162162162 }
{ "_id" : { "freq_conso_viande" : 7, "freq_conso_viande_lab" : "3 /jour" }, "poidsMoy" : 66.25555555555556 }
{ "_id" : { "freq_conso_viande" : 8, "freq_conso_viande_lab" : "4 /jour" }, "poidsMoy" : 73.55535714285715 }
{ "_id" : { "freq_conso_viande" : 9, "freq_conso_viande_lab" : "ne sait pas" }, "poidsMoy" : 71.25704697986576 }
{ "_id" : { "freq_conso_viande" : 99, "freq_conso_viande_lab" : "pas de réponse" }, "poidsMoy" : 70.905 }

```

- Ne concerne que les adultes,
Compte le nombre d'individus partis ou non en vacances durant les 12 derniers mois, selon leur groupe de revenus.

```javascript
db.Indiv.aggregate( [
   {
       $match: { $and: [
           {"menage.revenu" : {$lt : 14} },
           { vacances : {$lt : 3} },
           { vacances : {$gt : 0} },
           { ech : 1 }
       ]}
   },
   {
     $group : {
        _id : { revenus: "$menage.revenu", revenus_label: "$menage.revenu_lab.revenu.label", a_eut_des_vacances: "$vacances_lab.vacances_label" },

        count: { $sum: 1 }
     }
   },
   {
     $sort: { "_id": 1 }
   }
] )
```

Remarques:
Erreur repérée trop tard, concernant les labels des revenus.
Quelque soient les revenus (à un groupe près), les départs en vacances sont au moins aussi nombreux que les non-départs.
C'est entre le groupe 5 (840-990€/mois) et le groupe 6 (990-1300€/mois) que se creuse la différence. En dessous de 990€/mois, les individus sondés sont à peu près aussi nombreux à partir en vacances qu'à rester chez eux.
Pour les groupes 12 et 13 (>3100€/mois), ceux n'étant pas partis en vacances les douze derniers mois ne sont que 10%.

```json
{ "_id" : { "revenus" : [ 1 ], "revenus_label" : [ ], "a_eu_des_vacances" : "non" }, "count" : 28 }
{ "_id" : { "revenus" : [ 1 ], "revenus_label" : [ ], "a_eu_des_vacances" : "oui" }, "count" : 34 }
{ "_id" : { "revenus" : [ 2 ], "revenus_label" : [ ], "a_eu_des_vacances" : "non" }, "count" : 51 }
{ "_id" : { "revenus" : [ 2 ], "revenus_label" : [ ], "a_eu_des_vacances" : "oui" }, "count" : 56 }
{ "_id" : { "revenus" : [ 3 ], "revenus_label" : [ ], "a_eu_des_vacances" : "non" }, "count" : 60 }
{ "_id" : { "revenus" : [ 3 ], "revenus_label" : [ ], "a_eu_des_vacances" : "oui" }, "count" : 67 }
{ "_id" : { "revenus" : [ 4 ], "revenus_label" : [ ], "a_eu_des_vacances" : "non" }, "count" : 70 }
{ "_id" : { "revenus" : [ 4 ], "revenus_label" : [ ], "a_eu_des_vacances" : "oui" }, "count" : 67 }
{ "_id" : { "revenus" : [ 5 ], "revenus_label" : [ ], "a_eu_des_vacances" : "non" }, "count" : 48 }
{ "_id" : { "revenus" : [ 5 ], "revenus_label" : [ ], "a_eu_des_vacances" : "oui" }, "count" : 60 }
{ "_id" : { "revenus" : [ 6 ], "revenus_label" : [ ], "a_eu_des_vacances" : "non" }, "count" : 102 }
{ "_id" : { "revenus" : [ 6 ], "revenus_label" : [ ], "a_eu_des_vacances" : "oui" }, "count" : 166 }
{ "_id" : { "revenus" : [ 7 ], "revenus_label" : [ ], "a_eu_des_vacances" : "non" }, "count" : 82 }
{ "_id" : { "revenus" : [ 7 ], "revenus_label" : [ ], "a_eu_des_vacances" : "oui" }, "count" : 136 }
{ "_id" : { "revenus" : [ 8 ], "revenus_label" : [ ], "a_eu_des_vacances" : "non" }, "count" : 55 }
{ "_id" : { "revenus" : [ 8 ], "revenus_label" : [ ], "a_eu_des_vacances" : "oui" }, "count" : 128 }
{ "_id" : { "revenus" : [ 9 ], "revenus_label" : [ ], "a_eu_des_vacances" : "non" }, "count" : 53 }
{ "_id" : { "revenus" : [ 9 ], "revenus_label" : [ ], "a_eu_des_vacances" : "oui" }, "count" : 129 }
{ "_id" : { "revenus" : [ 10 ], "revenus_label" : [ ], "a_eu_des_vacances" : "non" }, "count" : 33 }
{ "_id" : { "revenus" : [ 10 ], "revenus_label" : [ ], "a_eu_des_vacances" : "oui" }, "count" : 138 }
{ "_id" : { "revenus" : [ 11 ], "revenus_label" : [ ], "a_eu_des_vacances" : "non" }, "count" : 43 }
{ "_id" : { "revenus" : [ 11 ], "revenus_label" : [ ], "a_eu_des_vacances" : "oui" }, "count" : 175 }
{ "_id" : { "revenus" : [ 12 ], "revenus_label" : [ ], "a_eu_des_vacances" : "non" }, "count" : 27 }
{ "_id" : { "revenus" : [ 12 ], "revenus_label" : [ ], "a_eu_des_vacances" : "oui" }, "count" : 191 }
{ "_id" : { "revenus" : [ 13 ], "revenus_label" : [ ], "a_eu_des_vacances" : "non" }, "count" : 8 }
{ "_id" : { "revenus" : [ 13 ], "revenus_label" : [ ], "a_eu_des_vacances" : "oui" }, "count" : 105 }
```

- Relation rapide entre fumeur et moyenne de poids, selon le sexe.

```javascript
db.Indiv.aggregate( [
   {
       $match: { $and: [
           { fume : {$lt : 5} },
           { fume : {$gt : 0} },
           { ech : 1 }
       ]}
   },
   {
     $group : {
        _id : { sexe: "$sexe_lab.sexe_label", fumeur: "$fume", fumeur_label: "$fume_lab.fume_label" },

        count: { $sum: 1 },
        poidsMoy: { $avg: "$poids" }
     }
   },
   {
     $sort: { "_id": 1 }
   }
] )
```

Remarques:
Dés lors qu'un individu a déjà fumé, une tendance se dégage. Cesser la cigarette fait prendre du poids, en consommer abondamment en fait perdre. Les différences sont à peu près constantes, quelque soit le sexe.
Il est difficile extrapoler pour les non-fumeurs.

```json
{ "_id" : { "sexe" : "Feminin", "fumeur" : 1, "fumeur_label" : "oui quotidiennement" }, "count" : 375, "poidsMoy" : 61.90999999999999 }
{ "_id" : { "sexe" : "Feminin", "fumeur" : 2, "fumeur_label" : "oui occasionnellement (<1/jour)" }, "count" : 69, "poidsMoy" : 63.46521739130435 }
{ "_id" : { "sexe" : "Feminin", "fumeur" : 3, "fumeur_label" : "non mais a deja fume" }, "count" : 325, "poidsMoy" : 65.00696202531644 }
{ "_id" : { "sexe" : "Feminin", "fumeur" : 4, "fumeur_label" : "non n'a jamais fume" }, "count" : 728, "poidsMoy" : 64.58995815899584 }
{ "_id" : { "sexe" : "Masculin", "fumeur" : 1, "fumeur_label" : "oui quotidiennement" }, "count" : 316, "poidsMoy" : 75.65445859872611 }
{ "_id" : { "sexe" : "Masculin", "fumeur" : 2, "fumeur_label" : "oui occasionnellement (<1/jour)" }, "count" : 48, "poidsMoy" : 77.96458333333334 }
{ "_id" : { "sexe" : "Masculin", "fumeur" : 3, "fumeur_label" : "non mais a deja fume" }, "count" : 382, "poidsMoy" : 80.78403141361257 }
{ "_id" : { "sexe" : "Masculin", "fumeur" : 4, "fumeur_label" : "non n'a jamais fume" }, "count" : 326, "poidsMoy" : 77.81753846153845 }
```


- Je m'étais intéressé aux catégories socio-professionnelles des individus mais quelque chose m'a bloqué.
Ces champs semblent de concerner que le ou la chef de famille. Or, si je fais cette requête qui ne concerne que les enfants :

db.Indiv.aggregate( [
   {
       $match: { ech : 2 }
   },
   {
     $group : {
        _id : { echantillon: "$ech_lab.ech_label", caterogie_socioprofessionnelle: "$menage.cspc" },

        count: { $sum: 1 }
     }
   },
   {
     $sort: { "_id": 1 }
   }
] )
```

Résultat :
Beaucoup d'enfants ont des catégories socio-professionnelles bien définies !
Plus sérieusement, le fait que tout individu a une valeur dans ces attributs indépendemment de s'il est concerné aurait à mes yeux faussé les résultats de ce que je souhaitais faire.
En effet, un ou une chef de famille ayant une famille plus nombreuse sera d'avantage représentée dans les comptes ou calculs de moyenne. Peut être est-ce aussi le cas pour les revenus étudiés plus haut.
Remarque: nous n'avons donc pas pris la peine de libeller les categories ici.

```json
{ "_id" : { "echantillon" : "Enfant", "caterogie_socioprofessionnelle" : [ 1 ] }, "count" : 25 }
{ "_id" : { "echantillon" : "Enfant", "caterogie_socioprofessionnelle" : [ 2 ] }, "count" : 43 }
{ "_id" : { "echantillon" : "Enfant", "caterogie_socioprofessionnelle" : [ 3 ] }, "count" : 23 }
{ "_id" : { "echantillon" : "Enfant", "caterogie_socioprofessionnelle" : [ 4 ] }, "count" : 9 }
{ "_id" : { "echantillon" : "Enfant", "caterogie_socioprofessionnelle" : [ 5 ] }, "count" : 28 }
{ "_id" : { "echantillon" : "Enfant", "caterogie_socioprofessionnelle" : [ 6 ] }, "count" : 133 }
{ "_id" : { "echantillon" : "Enfant", "caterogie_socioprofessionnelle" : [ 7 ] }, "count" : 27 }
{ "_id" : { "echantillon" : "Enfant", "caterogie_socioprofessionnelle" : [ 8 ] }, "count" : 41 }
{ "_id" : { "echantillon" : "Enfant", "caterogie_socioprofessionnelle" : [ 9 ] }, "count" : 99 }
{ "_id" : { "echantillon" : "Enfant", "caterogie_socioprofessionnelle" : [ 10 ] }, "count" : 146 }
{ "_id" : { "echantillon" : "Enfant", "caterogie_socioprofessionnelle" : [ 11 ] }, "count" : 210 }
{ "_id" : { "echantillon" : "Enfant", "caterogie_socioprofessionnelle" : [ 12 ] }, "count" : 15 }
{ "_id" : { "echantillon" : "Enfant", "caterogie_socioprofessionnelle" : [ 14 ] }, "count" : 2 }
{ "_id" : { "echantillon" : "Enfant", "caterogie_socioprofessionnelle" : [ 15 ] }, "count" : 9 }
{ "_id" : { "echantillon" : "Enfant", "caterogie_socioprofessionnelle" : [ 16 ] }, "count" : 23 }
{ "_id" : { "echantillon" : "Enfant", "caterogie_socioprofessionnelle" : [ 17 ] }, "count" : 1 }
{ "_id" : { "echantillon" : "Enfant", "caterogie_socioprofessionnelle" : [ 18 ] }, "count" : 20 }
{ "_id" : { "echantillon" : "Enfant", "caterogie_socioprofessionnelle" : [ 19 ] }, "count" : 22 }
{ "_id" : { "echantillon" : "Enfant", "caterogie_socioprofessionnelle" : [ 20 ] }, "count" : 2 }
{ "_id" : { "echantillon" : "Enfant", "caterogie_socioprofessionnelle" : [ "" ] }, "count" : 1 }
```
