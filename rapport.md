# Rapport de projet de Base de Données Évoluée

*par MENARD Mica, WIBAUX Robin & JAMET Félix*

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
mongoimport --type csv --db entredoproj --collection "Indiv" --file Table_indiv.csv --headerline
mongoimport --type csv --db entredoproj --collection "Menage" --file Table_menage_1.csv --headerline
mongoimport --type csv --db entredoproj --collection "Nutrition" --file Table_indnut.csv --headerline
mongoimport --type csv --db entredoproj --collection "Repas" --file repas_monocle.csv --headerline
mongoimport --type csv --db entredoproj --collection "Conso" --file conso_monocle.csv --headerline
mongoimport --type csv --db entredoproj --collection "Nomenclature" --file Nomenclature_3.csv --headerline
```
### 5- Agrégation des nomen_.csv dans les collections autres que Indiv

La première étape de notre agrégation consiste à agréger les nomenclatures concernant les ménages avec la collection Menage (exécution dans la console mongo de [Aggregation_labels-bis.js](https://github.com/mooss/entredoproj/blob/master/Aggregation_labels-bis.js).
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

Notre procédons à la même chose pour la table Conso


### 7- Agrégation de Menage, Indnut, Repas et Conso dans Indiv
### 8- Agrégation des nomen_.csv restant

### Choix du Schéma

### Réalisation des Requêtes
