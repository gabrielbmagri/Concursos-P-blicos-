# Análise de simulado por assunto

Na aba Simulados, abra o simulado e envie ao Claude o gabarito comentado e as suas respostas, junto com este texto. Cole a resposta no campo "Análise por assunto".

```
Vou te enviar o gabarito comentado de um simulado (texto, PDF ou imagens) e as minhas respostas. Analise item por item e agrupe por assunto do edital. Responda SOMENTE com um bloco de codigo de texto simples, uma linha por assunto, neste formato:

Constitucional | Poder Legislativo na CF e estatuto dos parlamentares | 5 | 2 | 1 | conteúdo
Português | Classes de palavras | 3 | 1 | 0 | pegadinha

Regras:
1. Campos separados por | (barra vertical), nesta ordem: Matéria | Assunto | Certos | Errados | Brancos | Motivo principal dos erros. Nunca use | dentro do texto.
2. Matéria deve ser uma destas: Constitucional, Administrativo, Português, Inglês, Legislativo, Linguística, Ciência Política, TI e Dados, Fala e IA.
3. Assunto é o nome do assunto do edital a que o item pertence. Uma linha por assunto, somando os itens daquele assunto.
4. Cada item da prova entra uma só vez. A soma de certos, errados e brancos de todas as linhas tem que ser igual ao total de itens da prova.
5. Motivo é um destes: conteúdo, interpretação, pegadinha ou desatenção. Use o que mais se aplicou aos erros do assunto. Deixe vazio se não houve erro.
6. Não escreva nada fora do bloco.
```
