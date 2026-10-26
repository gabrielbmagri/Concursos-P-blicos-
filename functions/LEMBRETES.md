# Lembretes por notificação e e-mail

O painel tem duas partes:

1. **No aplicativo** (já pronto): a aba **Lembretes** guarda suas preferências e o painel grava, a cada alteração, um resumo do seu estudo (metas do dia, revisões, Anki, ofensiva, semana) em `usuarios/<seu id>/notif/estado`.
2. **No servidor** (precisa ser ligado uma vez): a pasta `functions/` tem uma função agendada que roda a cada 15 minutos, lê esse resumo e manda as notificações e e-mails nos horários que você escolheu. Ela fica no Firebase e não depende de nenhum computador seu ligado.

## O que o servidor envia

| Aviso | Quando |
|---|---|
| Resumo do dia | Todo dia no horário escolhido (padrão 07:00): metas, revisões, Anki e dias para a prova. Também por e-mail. |
| Cutucada dura | Se até as 14:00 você não estudou nada, com uma frase sem dó. |
| Revisões pendentes | 17:00, se houver revisão do dia ou atrasada. |
| Questões da meta | 18:30, se a meta em andamento tem menos de 50 questões. |
| Anki do dia | 19:00, se há cartões vencidos. |
| Ofensiva em risco | 20:00 e 22:30, se você ainda não estudou e vai perder os dias seguidos. |
| Meta do dia | 21:00, se as metas de hoje não foram batidas. |
| Fechamento da semana | Sábado 18:00: quanto falta. Domingo 18:00: resumo da semana, também por e-mail. |
| Contagem da prova | A 100, 60, 30, 14, 7, 3, 2 e 1 dia da prova e no dia. Também por e-mail. |
| Meta demorando | Quando uma meta em "estudando" passa do limite de horas. |

Cada aviso se liga e desliga na aba Lembretes, e os horários são editáveis (horário de Brasília). Nenhum aviso se repete no mesmo dia.

## Ligar o servidor (uma vez)

### 1. Plano Blaze do Firebase
As funções agendadas só existem no plano **Blaze** (pague pelo que usar). Para este uso a cota gratuita cobre tudo, então o custo esperado é zero ou centavos. No console do Firebase: projeto `educacional-511014` > Uso e faturamento > Modificar plano > Blaze. Vale criar um alerta de orçamento de R$ 10.

### 2. E-mail (Resend)
1. Crie uma conta grátis em resend.com com o e-mail onde quer receber os avisos.
2. Em API Keys, crie uma chave. Sem domínio próprio, o Resend só entrega para o e-mail da própria conta, o que é suficiente aqui.
3. Guarde a chave: ela é um segredo e não deve ir para o GitHub nem para o painel.

### 3. Publicar as funções
No computador (com o Firebase CLI instalado e `firebase login` feito), dentro da pasta do projeto:

```
firebase functions:secrets:set RESEND_API_KEY --project educacional-511014
firebase deploy --only functions --project educacional-511014
```

Se preferir, passe a chave e peça ao Claude para publicar.

### 4. No celular
1. Abra https://painel-de-metas.web.app no celular.
2. **iPhone (iOS 16.4 ou mais):** toque em Compartilhar > Adicionar à Tela de Início e abra o painel pelo ícone novo. As notificações do iPhone só funcionam assim. **Android:** pode ativar direto no Chrome, ou instalar pelo menu "Instalar app".
3. No painel: menu > Lembretes > **Ativar neste aparelho** e aceite a permissão.
4. Toque em **Enviar teste**. A notificação (e o e-mail, se ligado) chega em segundos.

Quando o servidor estiver rodando, o topo da aba mostra "Servidor de lembretes ativo".

## Testes

`cd functions && npm install && npm test` roda os testes das regras (horários, deduplicação, ofensiva, semana, prova) sem precisar de internet.
