# Painel de metas: como colocar no ar com login e senha

O painel hospedado no Firebase tem um endereço próprio (`https://SEU-PROJETO.web.app`), pede e-mail e senha e guarda tudo no banco de dados do Google (Firestore). Funciona em qualquer aparelho. O plano gratuito (Spark) é suficiente.

## 1. Criar o projeto

1. Entre em https://console.firebase.google.com e clique em **Adicionar projeto**. Dê um nome (por exemplo `painel-metas`). O Google Analytics pode ficar desligado.
2. Em **Criação > Authentication > Começar > Método de login**, ative **E-mail/senha**.
3. Em **Authentication > Usuários > Adicionar usuário**, cadastre o seu e-mail e uma senha.
4. Ainda em Authentication, abra **Configurações > Ações do usuário** e desmarque **Ativar criação (cadastro)**. Assim ninguém mais consegue criar conta.
5. Em **Criação > Firestore Database > Criar banco de dados**, escolha **modo de produção** e a região **southamerica-east1 (São Paulo)**. A região não pode ser mudada depois.

## 2. Ligar o painel ao projeto

1. Em **Configurações do projeto (engrenagem) > Seus apps**, clique no ícone **Web (`</>`)**, registre um app e copie o bloco `firebaseConfig`.
2. Cole os valores em `painel/firebase-config.js`. Esses valores não são segredo: quem protege os dados são o login e as regras do banco.
3. No arquivo `.firebaserc`, troque `SEU-PROJETO` pelo ID do projeto.

## 3. Publicar

Precisa do Node.js. No terminal, dentro da pasta do repositório:

```
npm install -g firebase-tools
firebase login
firebase deploy --only hosting,firestore:rules
```

O comando mostra o endereço do painel. Abra, entre com o e-mail e a senha do passo 1 e pronto.

## Segurança

O arquivo `firestore.rules` só deixa cada pessoa ler e gravar dentro da própria pasta (`usuarios/{seu id}`). Sem login, nada é lido nem gravado.

## Atualizar o cronograma ou o painel

Depois de mudar `dados/cronograma.json` ou `painel/template.html`:

```
python3 painel/build.py
firebase deploy --only hosting
```

Os seus registros ficam no banco e não são afetados.

## Levar os dados que já estão na versão de teste

Na aba **Questões**, no fim da página, use **Baixar backup** na versão antiga. Na versão nova, depois de entrar, use **Restaurar backup** e escolha o arquivo. Dá para fazer um backup quando quiser, por segurança.

## Sem configurar o Firebase

Enquanto `firebase-config.js` tiver os valores de exemplo, o painel abre sem login e salva só no aparelho em que você está.
