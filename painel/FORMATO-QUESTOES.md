# Questões inéditas para o Banco de questões

Na aba Questões (Adicionar), envie ao Claude estas instruções junto com o assunto, o resumo ou o texto-base. Cole a resposta no campo "Colar ou enviar as questões".

```
Quando eu pedir questões inéditas para o meu banco de questões, responda SOMENTE com um arquivo .txt de texto simples (sem explicações fora dele), neste formato:

# Matéria: Linguística
# Assunto: Teoria do signo linguístico
# Caderno: Aprendizado
# Subtópico: Arbitrariedade e motivação
CE | O signo linguístico une um significante e um significado. | C | Correto: é a definição saussuriana de signo. | fácil
CE | Para Saussure, a relação entre significante e significado é necessariamente motivada. | E | Errado: Saussure defende a arbitrariedade do signo.
ME | Assinale a alternativa que apresenta um exemplo de arbitrariedade do signo. | B | A palavra é formada por derivação ;; Palavras diferentes designam o mesmo referente em línguas distintas ;; O som imita o ruído do objeto ;; O significado depende do contexto ;; O signo é imutável na fala | Letra B: línguas diferentes usam significantes distintos para o mesmo referente. As demais não tratam de arbitrariedade. | médio

Regras:
1. As linhas que começam com # valem para todas as questões abaixo delas, até a próxima linha igual. Matéria deve ser uma destas: Constitucional, Administrativo, Português, Inglês, Legislativo, Linguística, Ciência Política, TI e Dados, Fala e IA. Assunto é o nome do assunto do edital. Caderno agrupa as questões do pedido (veja a regra 7).
2. Uma linha por questão, com os campos separados por | (barra vertical). Nunca use | dentro do texto.
3. Tipos: CE = afirmação para julgar como Certo ou Errado, no estilo Cebraspe. Campos: CE | afirmação | C ou E | comentário | dificuldade | subtópico. ME = múltipla escolha. Campos: ME | enunciado | letra do gabarito (A a E) | alternativas separadas por ;; (sem escrever as letras, de 2 a 5 alternativas, na ordem) | comentário | dificuldade | subtópico.
4. Cada comentário (gabarito comentado) deve ser explicativo o bastante para eu entender o porquê, mas curto: objetivo, sem ser vago. Explique por que o gabarito está certo e, nas ME, por que as demais estão erradas.
5. Misture os tipos, intercalando ME e CE quando ajudar, com cerca de 60% em CE. Nas CE, equilibre os gabaritos entre C e E e use pegadinhas comuns da banca. Nas ME, varie a letra do gabarito.
6. Baseie as questões no conteúdo do edital e, se eu enviar um resumo ou texto, apenas nele. Não invente artigos de lei, números, autores nem citações. Se não tiver certeza de um dado, não faça a questão sobre ele.
7. Quantidade e estrutura: gere no mínimo 80 questões por meta, a não ser que eu peça outra quantidade, em duas partes, e entregue tudo em um arquivo .txt. PARTE 1, linha "# Caderno: Aprendizado": 50 questões em ordem pedagógica, do mais fácil ao mais difícil, de modo que cada conceito seja aprendido antes de ser cobrado e, ao final, eu domine tudo o que a aula ou meta pede. PARTE 2, linha "# Caderno: Revisão mista": 30 questões mistas para revisão, em que os conceitos de todos os subtópicos se misturam, são recordados e se combinam entre si (intertextualidade), mais próximas da cobrança da prova real (enunciados mais longos, pegadinhas, exceções e comparações). Na parte 2 a ordem é embaralhada, sem agrupar por subtópico, e a dificuldade é média a difícil.
8. A dificuldade é o penúltimo campo: fácil, médio ou difícil (opcional). Se todas tiverem o mesmo nível, pode usar a linha "# Dificuldade: médio" no topo em vez de repetir em cada questão.
9. Classifique cada questão em um subtópico do assunto, para que eu saiba onde estou bem e onde estou mal. Use a linha "# Subtópico: nome" antes de cada grupo de questões do mesmo subtópico (ela vale até a próxima) ou preencha o campo subtópico no fim da linha. Na parte 2, como as questões se misturam, preencha o campo subtópico em cada linha. Use o nome do subtópico como aparece no edital ou no material (por exemplo, "Do Senado Federal (art. 52)"), de 3 a 8 subtópicos por assunto, e sempre os mesmos nomes nos próximos pedidos do mesmo assunto e nos baralhos de Anki.
10. Quando eu pedir um resumo completo, responda em texto normal e organizado por tópicos, sem esse formato.
```

## Estrutura de cada pedido

Cada meta recebe no mínimo 80 questões em um único arquivo .txt: 50 em `# Caderno: Aprendizado` (ordem pedagógica, do fácil ao difícil) e 30 em `# Caderno: Revisão mista` (conceitos misturados, no estilo da prova). No painel, o atalho de questões da meta usa o caderno Aprendizado na primeira passada, e o atalho da revisão usa a Revisão mista, em ordem aleatória.
