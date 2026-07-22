import {
  IconInfoCircle,
  IconAlertTriangle,
  IconCheck,
  IconAlertCircle,
} from "@tabler/icons-react";
import {
  PrismAlert,
  PrismAlertTitle,
  PrismAlertDescription,
} from "~/components/prism";
import {
  GallerySection,
  GallerySectionHeader,
  GallerySectionContent,
  GalleryItem,
} from "./GalleryHelperComponents";

export function AlertSection() {
  return (
    <div id="prism-alert">
      <GallerySection>
        <GallerySectionHeader
          description="Componentes de notificação semântica utilizando a paleta de cores corrigida no OKLCH."
          title="PrismAlert"
        />
        <GallerySectionContent>
          <GalleryItem label="Default">
            <PrismAlert>
              <IconInfoCircle />
              <PrismAlertTitle>Informações Gerais</PrismAlertTitle>
              <PrismAlertDescription>
                Este alerta usa o tema padrão neutro do card.
              </PrismAlertDescription>
            </PrismAlert>
          </GalleryItem>
          <GalleryItem label="Error">
            <PrismAlert variant="error">
              <IconAlertTriangle />
              <PrismAlertTitle>Acesso Recusado</PrismAlertTitle>
              <PrismAlertDescription>
                Suas credenciais de login não são válidas no sistema.
              </PrismAlertDescription>
            </PrismAlert>
          </GalleryItem>
          <GalleryItem label="Sucess">
            <PrismAlert variant="success">
              <IconCheck />
              <PrismAlertTitle>Senha Redefinida</PrismAlertTitle>
              <PrismAlertDescription>
                Sua senha foi atualizada com sucesso.
              </PrismAlertDescription>
            </PrismAlert>
          </GalleryItem>
          <GalleryItem label="Warning">
            <PrismAlert variant="warning">
              <IconAlertCircle />
              <PrismAlertTitle>Aviso de Sessão</PrismAlertTitle>
              <PrismAlertDescription>
                Sua conexão irá expirar em breve por inatividade.
              </PrismAlertDescription>
            </PrismAlert>
          </GalleryItem>
          <GalleryItem label="Info">
            <PrismAlert variant="info">
              <IconInfoCircle />
              <PrismAlertTitle>Atualização Disponível</PrismAlertTitle>
              <PrismAlertDescription>
                Uma nova versão do Prism foi implementada.
              </PrismAlertDescription>
            </PrismAlert>
          </GalleryItem>
        </GallerySectionContent>
      </GallerySection>
    </div>
  );
}
