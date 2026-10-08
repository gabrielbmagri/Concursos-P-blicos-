# Painel de metas: como funciona no ar

- **Endereços:** https://painel-de-metas.web.app (principal) e https://educacional-511014.web.app (mesmo painel).
- **Projeto Firebase:** `educacional-511014` (nome "educacional").
- **Login:** e-mail e senha, só para quem foi cadastrado no console do Firebase. O cadastro aberto está desligado. A sessão fica salva no aparelho e o painel não pede a senha de novo.
- **Primeiro acesso:** abra o e-mail "Reset your password" (ou "Redefinir senha") enviado pelo Firebase, crie a senha, toque em Continuar e entre no painel uma vez. Se perder o e-mail, na tela de entrada toque em "Primeiro acesso ou esqueci a senha".

## Backups dos dados

1. **Backup do Google, automático:** recuperação a qualquer momento dos últimos 7 dias, um backup por dia (guardado 14 dias) e um por semana (guardado 14 semanas). A restauração desses backups é feita pelo console ou pela linha de comando do Firebase e cria um banco novo.
2. **Backup diário dentro do painel:** um instantâneo por dia, guardado 30 dias, com botão "Restaurar" na aba Questões. Antes de restaurar, o estado atual é guardado como "antes da restauração".
3. **Arquivo:** na aba Questões, "Baixar backup" gera um arquivo JSON com tudo, e "Restaurar backup" lê esse arquivo.

O banco também tem proteção contra exclusão.

## Atualizar o painel

Depois de mudar `dados/cronograma.json` ou `painel/template.html`, no computador:

```
python3 painel/build.py
firebase deploy --only hosting --project educacional-511014
```

Os seus registros ficam no banco e não são afetados.

## Segurança

O arquivo `firestore.rules` só deixa cada pessoa ler e gravar dentro da própria pasta (`usuarios/{id}`). Sem login, nada é lido nem gravado. Os valores em `painel/firebase-config.js` são públicos por natureza.

## Sem o Firebase

Se `firebase-config.js` tiver os valores de exemplo (`COLE_AQUI`), o painel abre sem login e salva só no aparelho.
