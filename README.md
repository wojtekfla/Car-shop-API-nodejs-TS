# Projekt Car Shop

## Opis
Projekt umożliwia rejestrację, logowanie, zarządzanie użytkownikami i samochodami oraz symulację zakupu samochodów.

## Uruchomienie
1. Skompiluj projekt przy użyciu `docker-compose build`.
2. Skompiluj projekt przy użyciu `docker-compose up`.
3. Logowanie jako admi: login: `admin`, hasło:`admin123`
4. Plik .env wyłączony z .gitignore 


## Cele zadania
- CRUD dla users (create, read, update, delete)
- CRUD dla cars (create, read, update, delete)
- całość w Dockerze (Docker-compose)
- zapis do bazy danych w Postgresql
- obsługa błędów
- logowanie
- rejestracja 
- sprawdzanie roli/permissionów (admin widzi wszystko i może updatować wszystko, user może tylko swoje zasoby)
- serwowanie frontendu z poziomu serwera jako pliki statyczne
- SSE - (server side events), w momencie zakupu samochodu wysyłamy info do wszystkich podpiętych userów
- hack/fund, backdoor do zasilania konta usera
