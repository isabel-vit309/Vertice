// Foto de perfil de cada comunidade, escolhida pelo slug que o backend envia.
import captacao from "../assests/comunidades/captacao.svg";
import ciberseguranca from "../assests/comunidades/ciberseguranca.svg";
import desenvolvimento from "../assests/comunidades/desenvolvimento.svg";
import ecossistema from "../assests/comunidades/ecossistema.svg";
import iaDados from "../assests/comunidades/ia-dados.svg";
import impactoEsg from "../assests/comunidades/impacto-esg.svg";

export const communityImages: Record<string, string> = {
  desenvolvimento,
  ciberseguranca,
  "ia-dados": iaDados,
  captacao,
  "impacto-esg": impactoEsg,
  ecossistema,
};
