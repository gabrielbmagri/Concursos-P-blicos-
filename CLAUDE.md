# Contexto do projeto: Painel de Metas

Repositório dos painéis de estudo. Fale sempre em português, de forma direta e curta.

## O que existe

- **Painel da Câmara dos Deputados** (principal): `painel/template.html` + `dados/cronograma.json` → `python3 painel/build.py` gera `painel/index.html`. Abas de metas, revisões, questões, Ankis, desempenho, jornada, lembretes e biblioteca. Detalhes em `painel/LEIA-ME.md`.
- **Painel da CPA (Anbima)**: `painel/cpa/` (página única, verde, simulados de 50 questões). Os 15 simulados prontos são montados a partir de `dados/cpa/fontes/` com `python3 dados/cpa/montar.py`. Formato e regras em `painel/cpa/FORMATO-SIMULADO.md`.
- **Lembretes** (push e e-mail): `functions/`, ver `functions/LEMBRETES.md`. A pausa fica em `pausaAte` (Firestore `notif/config`).

## Publicar

Hosting no projeto Firebase `educacional-511014`, sites `painel-de-metas` e `educacional-511014`, pasta pública `painel`. A conta de serviço é enviada pelo usuário na conversa (nunca grave a chave no repositório nem a mostre):

```
GOOGLE_APPLICATION_CREDENTIALS=<caminho do JSON enviado> npx -y firebase-tools@13 deploy --only hosting --project educacional-511014 --non-interactive
rm -f firebase-debug.log painel/firebase-debug.log
```

## Reorganizar as metas (Câmara)

Edite `dados/plano.json` (`inicio`, `dias_sem_estudo`, `sem_fechamento`, `metas_por_semana` = 15) e rode `python3 dados/reorganizar.py` (simulação) e depois `--aplicar`; em seguida build e deploy. Detalhes em `dados/REORGANIZAR.md`.

Preferências do usuário quando ele volta de uma pausa:
- Nunca jogar tudo o que está pendente num único dia. Diluir revisões atrasadas ao longo da semana (no máximo 2 atrasadas por dia), incluindo caderno de erros, e ajustar as metas a partir do dia da volta.
- Desligar os lembretes durante a pausa (`pausaAte` = dia da volta).

## Situação atual (09/11/2026)

- Câmara: estudos pausados; o usuário volta "semana que vem" e ainda vai dizer o dia. Quando disser: atualizar `plano.json` (`inicio` = dia da volta, dias parados em `dias_sem_estudo`), diluir revisões pendentes, ajustar `pausaAte`, build e deploy.
- CPA: prova sem data marcada; o usuário define a data no próprio painel.

## Questões, Ankis e simulados

- Método de questões e de Ankis: `painel/FORMATO-QUESTOES.md` e `painel/FORMATO-BARALHOS.md` (progressão pedagógica, fidelidade à banca, gabarito comentado que ensina, sem estatísticas inventadas).
- Simulados da CPA: regras de 2026 (JCP 17,5%, FGC R$ 250 mil por conglomerado e R$ 1 milhão a cada 4 anos, Lei 14.754/2023, Lei 14.803/2024 etc.). A certa não pode ser visivelmente mais longa que os distratores, e não se repetem enunciados entre simulados.
