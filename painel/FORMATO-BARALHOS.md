# Como pedir baralhos de estudo ao Claude

O painel lê baralhos escritos em texto simples. Cole as instruções abaixo uma vez no início de uma conversa (ou nas instruções de um Projeto do Claude). Depois é só pedir: "Faça um baralho de Poder Legislativo na CF" ou "Faça um baralho com este texto: ...". Copie a resposta e cole na aba **Ankis**, em **Importar baralho**.

O painel também importa planilhas (.xlsx, .csv) com as colunas **Tipo, Frente, Verso, Matéria, Assunto, Baralho e Explicação**. O mesmo formato de texto funciona em arquivo .txt.

## Instruções para colar

```
Quando eu pedir um baralho de estudo, responda SOMENTE com um bloco de codigo de texto simples, neste formato:

# Matéria: Constitucional
# Assunto: Poder Legislativo na CF e estatuto dos parlamentares
# Baralho: CF - Poder Legislativo
P | Quantos senadores cada estado elege? | Três senadores, cada um com dois suplentes. | CF art. 46
L | O Senado é composto por {{três}} senadores por estado. | | CF art. 46
CE | A Câmara dos Deputados é composta por representantes eleitos pelo sistema majoritário. | E | É o sistema proporcional (CF art. 45).

Regras:
1. As linhas que começam com # valem para todos os cartões abaixo delas. Matéria deve ser uma destas: Constitucional, Administrativo, Português, Inglês, Legislativo, Linguística, Ciência Política, TI e Dados, Fala e IA. Assunto é o nome do assunto do edital.
2. Uma linha por cartão, com os campos separados por | (barra vertical). Nunca use | dentro do texto.
3. Tipos: P = pergunta e resposta; L = lacuna, com a parte escondida entre {{ e }}; CE = afirmação para marcar Certo ou Errado como na prova (resposta C ou E, e a explicação no último campo).
4. Último campo é a fonte ou a explicação (artigo, lei, justificativa). Pode ficar vazio.
5. Cartões curtos, um conceito por cartão. Misture os três tipos, com cerca de metade em CE, no estilo Cebraspe (afirmações com pegadinhas comuns).
6. Se eu enviar um texto, baseie os cartões só nele e não invente artigos de lei nem números. Se não souber, deixe o campo da fonte vazio.
7. De 20 a 40 cartões por pedido, a não ser que eu peça outra quantidade.
```

## Tipos de cartão

- **P (pergunta e resposta):** a frente é a pergunta, o verso é a resposta.
- **L (lacuna):** a frase tem a parte escondida entre duas chaves de cada lado. Você tenta lembrar antes de ver.
- **CE (Certo ou Errado):** uma afirmação no estilo da prova. Você marca Certo ou Errado, e a explicação aparece depois.

## Como o estudo funciona

Depois de ver a resposta, você escolhe Errei, Difícil, Bom ou Fácil. O painel agenda o próximo dia de cada cartão (o intervalo aparece no botão). Cartões errados voltam na mesma sessão. Os intervalos nunca passam do dia anterior à prova.
