# О проекте

Этот проект форк [map-diff-viewer](https://github.com/space-wizards/map-diff-viewer) автор [DrSmugleaf](https://github.com/DrSmugleaf) Он был взят и улучшен для более удобного использования

# Установка

<table>
<tr>
<th>Хостинг через GitHub Pages</th>
<th>Локалка</th>
</tr>
<tr>
<td>

```
# Хостинг
Сделать форк данного репозитория
Перейти в настройки форкнутого репозитория
Перейти в GitHub Pages
В Source выбрать "Deploy from a branch"
В Branch выбрать ветку "master" а потом папку docs и сохранить

# Зайти
Нужно подождать пока сайт запустится 
https://[ваш никнейм в гитхабе].github.io/horizon-map-diff-viewer/?old=maps/Cluster.png&new=maps/CorvaxCluster.png
```

</td>
<td>

```
# Зависимости
[Python](https://www.python.org/downloads/)

# Установка
git clone https://github.com/lAstronautl/horizon-map-diff-viewer.git
cd horizon-map-diff-viewer/map-diff-viewer
python -m http.server [Порт]

# Зайти
http://localhost:[Порт]/?old=maps/Cluster.png&new=maps/CorvaxCluster.png
```

</td>
</tr>
</table>

# Лицензия
Весь код репозитория находится под [MIT лицензией](https://github.com/lAstronautl/horizon-map-diff-viewer/blob/master/LICENSE).  