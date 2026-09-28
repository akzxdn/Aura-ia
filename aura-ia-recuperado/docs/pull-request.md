# Reformula a experiência visual da AURA e corrige navegação e diálogos

A interface recuperada expunha elementos auxiliares, sobrepunha o título ao núcleo e mantinha cinco telas de scroll no chat. A sidebar não abria no celular e os diálogos não fechavam corretamente.

Esta alteração cria um sistema visual grafite, marfim e âmbar para a landing e o chat; preserva os cinco capítulos de scroll e o canvas procedural; implementa sidebar mobile, foco e fechamento dos diálogos; organiza mensagens, Markdown, compositor, anexos e estados; e aplica efetivamente as preferências de movimento. APIs, serviços, autenticação e persistência permanecem intactos.

Validação: build e TypeScript aprovados. Chrome em 360, 768 e 1440 px; scroll, teclado, menus, envio SSE de demonstração, cancelamento, cópia, histórico, exclusão e anexos verificados. Zero erros de console na sessão limpa. O comando preexistente `next lint` é inválido nesta versão de Next.

O histórico do GitHub contém apenas o upload recuperado e o README inicial; não foi encontrada uma interface anterior para restaurar. Voz, autenticação local, armazenamento de anexos e persistência durável já estavam incompletos e são documentados separadamente.

Ver `docs/interface-review.md` para diagnóstico, evidências e capturas antes/depois.
