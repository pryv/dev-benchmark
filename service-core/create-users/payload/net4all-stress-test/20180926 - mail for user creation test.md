

Bonjor,

> Concernant la mise en place d'un rate limiter, je pense que cela ne ferait que ralentir le problème, étant donné que le problème s'est quand même produit plus tard en réduisant le nombre d'utilisateurs parallèles, et donc le nombre d'utilisateurs créés par heure.

MongoDB utilise un nombre croissant de RAM dans un cas de création de comptes utilisateurs prolongé. Etant donné que MongoDB atteint la saturation plus lentement après avoir pu créér davantage d'utilisateurs lorsqu'on diminue le nombre requêtes en parallèles, nous en déduisons que les resources allouées lors de la création de comptes sont libérées après un certain moment. Cela signifie qu'il existe une certaine limite de vitesse de création de comptes.

Lors de stress test sur la plateforme staging, nous avons remarqué que MongoDB redémarrait lorsqu'il atteignait une situation de saturation de RAM. Après cela, la plateforme est fonctionnelle avec un usage de resources correct; sur la plateforme staging, un core avec 65k comptes utilise autant de resources qu'un core avec 1.5k comptes.

Le problème que nous devons éviter est le crash qui conduit à une indisponibilité du service pendant plusieurs minutes, car il procède par une phase de "réparation de la DB" qui prend environ 20 minutes sur une machine 4 core / 8 GB RAM / HDD.

Avez-vous également observé ce redémarrage de MongoDB et une plateforme fonctionnelle suite aux situations de saturation de RAM décrites dans les mail précédents?

Si cela est le cas, il nous faut vérifier que l'usage des resource retourne à des valeurs standard en cas de création d'utilisateurs plus modérée. 

Je vous propose non pas de créer les utilisateurs plus lentement, mais d'en créer disons 500-1'000 avec 10 requêtes en parallèle et de regarder l'utilisation de la mémoire, en particulier le temps que cela prend pour revenir à un niveau acceptable. Vous pouvez bien sûr utiliser les chiffres que vous souhaitez, il suffit qu'ils soient inférieurs à une situation de saturation de RAM.

Si la machine revient à une situation stable, nous pourrons utiliser ces chiffres comme vitesse de création de compte supportée. Sachant que l'on souhaite environ 100'000 comptes créés sur plusieurs mois, cela devrait être conforme aux spécifications du projet Riva.

Pour la suite du test de charge, je vous propose de créer les 100'000 utilisateurs en faisant les requêtes directement aux bases de données. Nous pouvons vous fournir les scripts nécessaires. Cela prendra la place des requêtes décrites dans la partie 1 "Création d'utilisateurs et structure". 

Suite à cela, vous pourrez procéder à la partie 2 comme prévu.

Qu'en pensez-vous?

> J'ai pu également confirmer que le problème vient effectivement de MongoDB, qui utilise le plus de RAM possible, ce qui empêche les autres processus d'allouer de la mémoire ensuite.

Ce cas peut être éviter en limitant l'usage de RAM de MongoDB, mais cela ne fait que déplacer le problème car tous les appels API dépendent du bon fonctionnement de MongoDB.

> Je pense qu'une solution qui pourrait être viable serait de déplacer le container mongodb sur une instance dédiée. De ce fait, l'utilisation RAM de MongoDB n'impacterait plus les autres services.

Je pense que cela ne ferait que déplacer le problème, tout comme limiter l'usage de RAM de MongoDB sur la machine.

Je suis disponible pour en discuter si vous le souhaitez.

Bon après-midi,