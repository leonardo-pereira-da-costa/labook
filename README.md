# PROJETO LABOOK - BACKEND

O Labook é uma rede social com o objetivo de promover a conexão e interação entre pessoas. Quem se cadastrar no aplicativo poderá criar e curtir publicações.

## Tecnologias utilizadas
- Node.js
- Typescript
- Express
- Knex
- SQL e SQLite
- JWT
- Bcrypt
- UUID
- Dotenv
- Postman
- Roteamento
- Autenticação e autorização
- Geração de hashes
- Arquitetura em camadas

## Funcionalidades

O backend do Labook possui os seguintes endpoints:

### Criar usuário

Endpoint: [POST]`/user/signup`

Body da Requsição:
```json
{
"name": "Leonardo",
"email": "Leonardo@example.com",
"password": "senha00"
}
```
Output de sucesso:
```json
{
"token": "<token de autenticação>"
}
```

### Login
Realiza o login de um usuário na plataforma.

Endpoint: [POST]`/user/login`

Body da Requisição:
```json
{
"email": "leonardo@example.com",
"password": "senha00"
}
```
Output de sucesso:
```json
{
"token": "<token de autenticação>"
}
```

### Criar Post
Cria um novo post na plataforma.

Endpoint: [POST]`/post/create`

Body da Requisição:
```json
{
"content": "Iniciando meu projeto."
}
```
Output de sucesso:
```json
{
"message": "Post criado com sucesso!"
}
```
### Editar Post
Edita um post existente na plataforma.

Endpoint: [PUT]`/post/edit/:postId`

Body da Requisição:
```json
{
"content": "Entregando meu projeto."
}
```
Output de sucesso:
```json
{
"message": "Post editado com sucesso!"
}
```
### Deletar Post
Deleta um post existente na plataforma.

Endpoint: [DELETE]`/post/delete/:postId`
Output de sucesso:
```json
{
"message": "Post deletado com sucesso!"
}
```
### Dar like em post
Adiciona um like em um post existente na plataforma.

Endpoint: [PUT]`/post/like/:postId`
Output de sucesso:
```json
{
"message": "Like adicionado com sucesso!"
}
```
### Dar dislike em post
Adiciona um dislike em um post existente na plataforma.

Endpoint: [PUT]`/post/dislike/:postId`
Output de sucesso:
```json
{
"message": "Dislike adicionado com sucesso!"
}
```

Projeto criado por Leonardo Pereira da Costa
GitHub: https://github.com/leonardo-pereira-da-costa