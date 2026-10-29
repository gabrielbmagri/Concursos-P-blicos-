# Como pedir baralhos de estudo ao Claude

O painel lê baralhos escritos em texto simples. Cole as instruções abaixo uma vez no início de uma conversa (ou nas instruções de um Projeto do Claude). Depois é só pedir: "Faça o baralho da meta Poder Legislativo na CF" (o Claude gera no mínimo 80 cartões, classificados por subtópico) ou "Faça um baralho com este texto: ...". Copie a resposta e cole na aba **Ankis**, em **Importar baralho**.

O painel também importa planilhas (.xlsx, .csv) com as colunas **Tipo, Frente, Verso, Matéria, Assunto, Baralho, Explicação e Subtópico**. O mesmo formato de texto funciona em arquivo .txt.

## Instruções para colar

```
Quando eu pedir um baralho de estudo para uma meta, responda SOMENTE com um arquivo .txt de texto simples. Sua resposta inteira é o arquivo: a primeira linha é "# Matéria: ..." e a última é o último cartão. Não escreva introdução, resumo, contagem, lista de subtópicos, observações, avisos nem despedida, não explique como os cartões foram feitos e não use bloco de código (```). Se puder anexar o arquivo, anexe o .txt e não escreva mais nada. O formato do arquivo é este:

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
5. Quantidade: no mínimo 80 cartões por meta, a não ser que eu peça outra quantidade (cada revisão do painel usa 15 cartões do assunto). Cumpra o mínimo com conhecimento relevante, sem encher o baralho com detalhes triviais, e nunca fique abaixo dele só para manter o baralho pequeno. Cubra TODO o conteúdo da meta ou da aula, sem deixar nenhum tópico do assunto sem cartão.
6. Classificação por subtópico: todo cartão deve pertencer a um subtópico do assunto. Use a linha "# Subtópico: nome" antes de cada grupo (vale até a próxima) ou preencha o último campo da linha. Use de 4 a 10 subtópicos por assunto, com o nome como aparece no edital ou no material, e sempre os mesmos nomes dos pedidos de questões do mesmo assunto. É isso que me mostra exatamente em que ponto do assunto eu esqueço. Subtópicos mais cobrados em prova ganham mais cartões.
7. Ordem pedagógica: do básico ao complexo, com cada conceito antes do que depende dele (definição antes de exceção, regra antes de pegadinha). Agrupe por subtópico.
8. Mistura de tipos: cerca de 45% CE no estilo Cebraspe, 30% lacuna e 25% pergunta e resposta.
9. Cartões atômicos: um único fato por cartão, sem depender de outro cartão. Verso com no máximo 25 palavras. Não copie artigos inteiros: extraia a ideia que cai em prova.
10. Use lacuna (L) para prazos, quóruns, números, competências e listas. Em listas, faça um cartão por item, não um cartão com a lista toda.
11. Faça cartões de contraste para o que se confunde (por exemplo, quem decide x quem aprova, prazo de uma casa x prazo da outra), com a diferença clara na resposta.
12. Nos CE, imite as pegadinhas da banca: troca de órgão, prazo, quórum ou competência, e palavras como sempre, nunca, apenas e exclusivamente. Equilibre as respostas C e E.
13. Quando houver um jeito fácil de lembrar (mnemônico, associação), escreva na explicação, começando por "Dica:".
14. Baseie os cartões no conteúdo do edital e, se eu enviar um resumo ou texto, apenas nele. Não invente artigos de lei, números, autores nem citações. Se não tiver certeza de um dado, não faça o cartão sobre ele.
15. Sem cartões repetidos ou quase iguais. Entregue tudo em um arquivo .txt, só com os cartões.
16. Metas de Prazos e números (as que têm "prazos" no nome): só cartões de prazos, quóruns, quantidades, contagens, maiorias e números que a lei seca da meta traz, no mínimo 100. Use lacuna (L) com UM número por cartão (por exemplo: o prazo é de {{dez}} dias), cartões de contraste entre casas e fases (Câmara x Senado, comissão x Plenário, dias corridos x úteis), CE com o número trocado e a fonte com o artigo exato. Subtópico: o procedimento ou a fase.
17. Objetivo dos cartões: não são resumos das questões. Cada cartão transforma um conhecimento importante em recuperação ativa e tem uma finalidade clara: ensinar ou revisar um conceito, uma regra, uma exceção, uma distinção, uma condição de aplicação ou uma armadilha recorrente da banca. Três metas: retenção ao longo do tempo, compreensão (por que a regra funciona e quando se aplica) e transferência (usar o conhecimento em questões diferentes das que já fiz). O cartão deve me permitir recuperar o conhecimento sem rever a questão original.
18. Quando eu enviar questões resolvidas com gabarito comentado, extraia o conhecimento, não copie a questão. Não crie um cartão por questão nem por alternativa: uma questão pode gerar vários cartões (se explora conceitos distintos e importantes), nenhum (se só exige interpretação circunstancial, sem conhecimento duradouro) ou compartilhar um único cartão com outras que testam a mesma regra (salvo diferença relevante de aplicação). Priorize conceitos fundamentais e frequentes, regras e exceções, distinções entre institutos parecidos, condições, requisitos, prazos, competências e consequências, critérios e classificações, erros de raciocínio que podem se repetir, armadilhas legítimas da banca e conhecimentos que conectam tópicos do edital. Evite detalhes triviais, informação periférica e frases decorativas.
19. Uma ideia principal por cartão, sem fragmentar de forma artificial o que só faz sentido junto. Não pergunte de uma vez definição, classificação, exceções e consequências; divida em perguntas menores e independentes. Perguntas específicas e diretas, que deixem claro o que devo recuperar sem revelar a resposta (qual a regra geral, qual a exceção, qual a diferença entre A e B, em que condições ocorre a consequência, qual erro torna a afirmação incorreta, o que muda quando a condição está presente). Nunca perguntas vagas como "fale sobre o assunto".
20. Respostas curtas, mas suficientes: o mínimo necessário para recuperar o conhecimento com precisão. Se houver ressalva, condição ou exceção importante, inclua; a concisão nunca pode comprometer a precisão. Sem parágrafos longos no verso: conhecimentos independentes viram cartões separados. Um exemplo curto ou uma observação que diferencie conceitos confundidos só quando ajudar. O aprofundamento fica nas questões e nos gabaritos comentados; o cartão reforça o que merece ser lembrado.
21. Priorização pela relevância para a prova, com a mesma lógica das questões: use o edital, as provas anteriores e o histórico de cobrança da banca para decidir o que merece cartão. Prefira conhecimentos recorrentes ou relevantes para a banca, fundamentais para outros assuntos, cobrados de formas diferentes, que envolvam exceções ou distinções que geram erro e que são difíceis de lembrar sem revisão. Não crie dezenas de cartões de detalhe de baixa relevância enquanto conceitos essenciais ficam sem cartão. Não invente estatística de incidência: sem evidência, use critério pedagógico e relevância para o edital, sem apresentar suposição como fato.
22. Use o gabarito comentado para decidir o que memorizar: o fundamento da alternativa correta, a regra que separa a correta dos distratores, a palavra, condição ou exceção que causa o erro e a confusão conceitual explorada. Quando uma alternativa estiver errada por inverter uma regra, não crie um cartão que reproduza a alternativa errada: crie um cartão que me obrigue a recordar a regra correta ou a distinção relevante.
23. Escolha o formato mais adequado ao conhecimento, sem precisar usar todos em cada bloco, dentro dos tipos P, L e CE: recuperação direta de definições, regras e fórmulas (P ou L); distinção entre conceitos confundidos, com a diferença determinante na resposta (P); regra e exceção, quando saber só a regra geral não basta (P ou L); identificação de erro, com uma afirmação errada para eu apontar o erro central ou corrigir, usada com moderação (CE, com a correção na explicação); aplicação curta, com uma situação hipotética breve para eu dizer qual regra ou consequência se aplica (P ou CE); fórmulas, critérios, requisitos e sequências relevantes para a prova (P ou L).
24. Sem pistas: a pergunta não entrega a resposta por expressões específicas demais, pistas gramaticais ou formulações que permitam acertar sem saber. Não copie a redação da questão original quando isso fizer o cartão depender da memória daquela questão; varie a formulação sem mudar o conceito. Quero lembrar do conhecimento, não reconhecer uma frase que já vi.
25. Sem redundância: antes de criar um cartão, veja se o conhecimento já está em outro cartão do mesmo conjunto (ou do baralho existente, se eu enviar). Dois cartões sobre a mesma informação: consolide ou diferencie seus objetivos. Mantenha os cartões complementares necessários para consolidar regra, exceção e aplicação. A meta é a menor quantidade de cartões necessária para revisar bem o que é relevante, respeitando o mínimo da regra 5.
26. A quantidade varia com a densidade conceitual e a importância para a prova, sem proporção fixa de cartões por questão, respeitando os limites e critérios de organização já definidos (regra 5). Não fabrique cartões só para cumprir número.
27. Revisão espaçada: o agendamento fica por conta do sistema de repetição espaçada do painel; não escreva cronograma de revisões dentro dos cartões. Se eu informar que errei uma questão ou tive dificuldade para lembrar um conceito, crie cartões de reforço que ataquem a causa do erro (a distinção, a condição ou a exceção esquecida), com formulação diferente da dos cartões anteriores do mesmo assunto.
```

## Tipos de cartão

- **P (pergunta e resposta):** a frente é a pergunta, o verso é a resposta.
- **L (lacuna):** a frase tem a parte escondida entre duas chaves de cada lado. Você tenta lembrar antes de ver.
- **CE (Certo ou Errado):** uma afirmação no estilo da prova. Você marca Certo ou Errado, e a explicação aparece depois.

## Como o estudo funciona

Depois de ver a resposta, você escolhe Errei, Difícil, Bom ou Fácil. O painel agenda o próximo dia de cada cartão (o intervalo aparece no botão). Cartões errados voltam na mesma sessão. Os intervalos nunca passam do dia anterior à prova.
