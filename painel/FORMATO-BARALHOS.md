# Como pedir baralhos de estudo ao Claude

O painel lê baralhos escritos em texto simples. Cole as instruções abaixo uma vez no início de uma conversa (ou nas instruções de um Projeto do Claude). Depois é só pedir: "Faça o baralho da meta Poder Legislativo na CF" (o Claude gera no mínimo 80 cartões, classificados por subtópico) ou "Faça um baralho com este texto: ...". Copie a resposta e cole na aba **Ankis**, em **Importar baralho**.

O painel também importa planilhas (.xlsx, .csv) com as colunas **Tipo, Frente, Verso, Matéria, Assunto, Baralho, Explicação e Subtópico**. O mesmo formato de texto funciona em arquivo .txt.

## Instruções para colar

```
Quando eu pedir um baralho de estudo para uma meta, responda SOMENTE com um arquivo .txt de texto simples (sem explicações fora dele), neste formato:

# Matéria: Constitucional
# Assunto: Poder Legislativo na CF e estatuto dos parlamentares
# Baralho: CF - Poder Legislativo
# Subtópico: Composição do Congresso Nacional
P | Quantos senadores cada estado elege? | Três senadores, cada um com dois suplentes. | CF art. 46
L | O Senado é composto por {{três}} senadores por estado. | | CF art. 46
CE | A Câmara dos Deputados é composta por representantes eleitos pelo sistema majoritário. | E | É o sistema proporcional (CF art. 45). | Câmara dos Deputados

Regras:
1. As linhas que começam com # valem para todos os cartões abaixo delas, até a próxima linha igual. Matéria deve ser uma destas: Constitucional, Administrativo, Português, Inglês, Legislativo, Linguística, Ciência Política, TI e Dados, Fala e IA. Assunto é o nome do assunto do edital. Baralho é o nome do baralho.
2. Uma linha por cartão, com os campos separados por | (barra vertical). Nunca use | dentro do texto.
3. Tipos: P = pergunta e resposta; L = lacuna, com a parte escondida entre {{ e }}; CE = afirmação para marcar Certo ou Errado como na prova (resposta C ou E, e a explicação no quarto campo). Campos: P | pergunta | resposta | fonte | subtópico ; L | texto com {{lacuna}} | (vazio) | fonte | subtópico ; CE | afirmação | C ou E | explicação | subtópico.
4. O campo fonte ou explicação traz o artigo, a lei ou a justificativa em uma frase curta. Pode ficar vazio, mas nunca invente.
5. Quantidade: no mínimo 80 cartões por meta, a não ser que eu peça outra quantidade. Cubra TODO o conteúdo da meta ou da aula, sem deixar nenhum tópico do assunto sem cartão.
6. Classificação por subtópico: todo cartão deve pertencer a um subtópico do assunto. Use a linha "# Subtópico: nome" antes de cada grupo (vale até a próxima) ou preencha o último campo da linha. Use de 4 a 10 subtópicos por assunto, com o nome como aparece no edital ou no material, e sempre os mesmos nomes dos pedidos de questões do mesmo assunto. É isso que me mostra exatamente em que ponto do assunto eu esqueço. Subtópicos mais cobrados em prova ganham mais cartões.
7. Ordem pedagógica: do básico ao complexo, com cada conceito antes do que depende dele (definição antes de exceção, regra antes de pegadinha). Agrupe por subtópico.
8. Mistura de tipos: cerca de 45% CE no estilo Cebraspe, 30% lacuna e 25% pergunta e resposta.
9. Cartões atômicos: um único fato por cartão, sem depender de outro cartão. Verso com no máximo 25 palavras. Não copie artigos inteiros: extraia a ideia que cai em prova.
10. Use lacuna (L) para prazos, quóruns, números, competências e listas. Em listas, faça um cartão por item, não um cartão com a lista toda.
11. Faça cartões de contraste para o que se confunde (por exemplo, quem decide x quem aprova, prazo de uma casa x prazo da outra), com a diferença clara na resposta.
12. Nos CE, imite as pegadinhas da banca: troca de órgão, prazo, quórum ou competência, e palavras como sempre, nunca, apenas e exclusivamente. Equilibre as respostas C e E.
13. Quando houver um jeito fácil de lembrar (mnemônico, associação), escreva na explicação, começando por "Dica:".
14. Baseie os cartões no conteúdo do edital e, se eu enviar um resumo ou texto, apenas nele. Não invente artigos de lei, números, autores nem citações. Se não tiver certeza de um dado, não faça o cartão sobre ele.
15. Sem cartões repetidos ou quase iguais. Entregue tudo em um arquivo .txt.
```

## Tipos de cartão

- **P (pergunta e resposta):** a frente é a pergunta, o verso é a resposta.
- **L (lacuna):** a frase tem a parte escondida entre duas chaves de cada lado. Você tenta lembrar antes de ver.
- **CE (Certo ou Errado):** uma afirmação no estilo da prova. Você marca Certo ou Errado, e a explicação aparece depois.

## Como o estudo funciona

Depois de ver a resposta, você escolhe Errei, Difícil, Bom ou Fácil. O painel agenda o próximo dia de cada cartão (o intervalo aparece no botão). Cartões errados voltam na mesma sessão. Os intervalos nunca passam do dia anterior à prova.
