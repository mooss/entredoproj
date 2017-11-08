# Transformer un fichier CRLF en fichier LF
```bash
perl -pi -e 's/\r\n/\n/g' input.file
```

# Ajouter la colonne nomen\_nojour\_tyrep dans repas
```bash
# d'abord, on cut les colonnes desirees vers un fichier
cut -d , -f "1,2,4" --output-delimiter=_ Table_repas.csv > last_column
# ensuite on les paste a la table originale vers la destination
paste -d ,  Table_repas.csv last_column > repas_monocle.csv
```
l'operation est similaire pour la table conso
