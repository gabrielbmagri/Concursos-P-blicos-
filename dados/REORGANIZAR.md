# Como reorganizar as metas por semana

O plano é refeito do zero a cada vez, a partir de três arquivos. Por isso subir ou descer o ritmo (10, 15, 20 metas por semana) não embaralha nada.

- `dados/cronograma.json`: as metas. Cada uma guarda `seq`, a posição na ordem original do plano, e `semana_plano`, a semana em que ela nasceu.
- `dados/estado.json`: o que já foi concluído e o que já tem registro no painel (ids das metas). Precisa ser atualizado antes de reorganizar.
- `dados/plano.json`: os parâmetros.
  - `metas_por_semana`: ritmo semanal (conta de segunda a sábado; o caderno de erros de domingo fica fora).
  - `inicio`: a data a partir da qual se reorganiza. Semanas anteriores ficam só com o que foi concluído.
  - `dias_sem_estudo`: datas de folga. O teto da semana cai na proporção (5 dias de 6 = 5/6 do ritmo).
  - `ajustes_por_semana`: ritmo próprio de uma semana, por exemplo `{"S8": {"metas": 6}}`.
  - `cortar_excedente`: se `true`, o que não couber no ritmo escolhido fica fora do plano (escondido e guardado) e volta sozinho quando o ritmo sobe.
  - `fora_do_plano`: ids de metas que você decidiu deixar de fora de vez. Ficam guardadas e escondidas até ganharem registro.
  - `semanas_fixas`: semanas que nunca mudam (a da prova, S15).

Regras: a ordem original das metas nunca muda; o que ainda não foi feito é redistribuído nessa ordem, semana por semana, até o teto. Cadernos de erros de domingo e revisões gerais só existem em semanas que têm estudo. Se as metas não couberem até a semana 14 e `cortar_excedente` estiver desligado, o script avisa e não grava nada.

Passos: atualizar `estado.json` (ver o painel), editar `plano.json`, rodar `python3 dados/reorganizar.py` para simular e `python3 dados/reorganizar.py --aplicar` para gravar, depois `python3 painel/build.py` e publicar.

Ritmo por primeira passada (a partir de 28/10/2026): `contar_apenas: ["teoria_questoes"]` faz só as metas de primeira passada contarem no teto (`metas_por_semana`: 18 = 3 por dia). Blocos de questões, inglês etc. acompanham na ordem do plano, no máximo `outros_por_semana` (10) por semana, e nunca passam à frente da primeira passada.

Distribuição dentro da semana (vale em toda reorganização): as metas pendentes de cada semana são intercaladas para que a mesma matéria nunca fique em seguida e cada matéria fique espalhada de forma proporcional; a ordem das metas de uma mesma matéria entre si (a do plano) nunca muda. `limite_por_semana` (ex.: `{"POR": 2}`) limita quantas metas visíveis de uma matéria entram na semana; o que passar vai para a semana seguinte.
