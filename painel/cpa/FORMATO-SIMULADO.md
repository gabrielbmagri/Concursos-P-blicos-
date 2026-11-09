# Formato dos simulados da CPA

O painel da CPA fica em `painel/cpa/` e, depois de publicado, abre em
https://painel-de-metas.web.app/cpa/ (mesmo login do painel de metas).

## Simulados que já vêm no painel

- Fontes em `dados/cpa/fontes/sNN*.json`. Em cada questão, a alternativa certa fica em `certa` e as três erradas em `erradas`, cada uma com o motivo do erro.
- `python3 dados/cpa/montar.py` embaralha a posição da resposta certa (A, B, C e D aparecem quase o mesmo número de vezes), confere tudo e grava `painel/cpa/simulados/`. O script recusa:
  - questão sem campo obrigatório;
  - simulado em que a certa é bem mais longa que as outras em mais de 10 questões;
  - questões parecidas demais entre simulados (enunciado repetido).
- `python3 dados/cpa/montar.py --cobertura` lista quantas questões cada item do programa já tem.

Formato de uma questão na fonte:

```json
{"pd":"2.1.3.2.2","dif":"Médio","nivel":"Compreensão",
 "caso":"Árvore de diálogo: nome do caso","etapa":"1/3",
 "contexto":"Situação de atendimento...",
 "enunciado":"Pergunta que termina em dois-pontos:",
 "certa":"texto da alternativa correta",
 "erradas":[["alternativa errada","por que está errada"],["...","..."],["...","..."]],
 "gabarito":"Explicação do conceito central",
 "dica":"Frase curta para memorizar"}
```

`caso` e `etapa` só existem nas questões em árvore de diálogo (sequências de 3 ou 4 etapas sobre o mesmo cliente).

## Anexar um simulado pelo painel

Na seção **Simulados**, o botão **Anexar simulado** aceita o JSON colado ou um arquivo `.json` no formato final:

```json
{"titulo":"Simulado extra","q":[
 {"pd":"1.2.4","dif":"Médio","contexto":"...","enunciado":"...",
  "alt":["texto A","texto B","texto C","texto D"],"certa":"C",
  "gabarito":"...","porque":{"A":"por que A está errada","B":"...","D":"..."},
  "dica":"..."}
]}
```

Regras usadas em todos os simulados (para pedir ao Claude):

1. 50 questões, na proporção da prova: bloco 1 com 10, bloco 2 com 20, bloco 3 com 15 e bloco 4 com 5; 10 delas em árvore de diálogo; de 3 a 6 com cálculo.
2. Múltipla escolha contextualizada no estilo do caderno oficial: um caso de atendimento, um enunciado que termina em dois-pontos e quatro alternativas com só uma correta.
3. Alternativas de tamanho parecido. A certa não pode ser sempre a mais longa nem a mais completa.
4. Gabarito que ensina: explica o conceito, diz por que cada alternativa errada está errada e termina com uma frase para memorizar.
5. Regras vigentes em 2026: JCP com IR de 17,5%; dividendos com retenção de 10% acima de R$ 50 mil por mês por empresa; LCI, LCA, CRI, CRA e debêntures incentivadas isentas para pessoa física; FGC de R$ 250 mil por CPF por conglomerado, com teto de R$ 1 milhão a cada 4 anos; escolha do regime da previdência até o primeiro resgate ou benefício (Lei 14.803/2024).
