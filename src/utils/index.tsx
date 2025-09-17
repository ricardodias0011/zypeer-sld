export const labelStatusSaving = {
  success: {
    color: '#24e975',
    label: "Salvo"
  },
  peding: {
    color: '#e9c824',
    label: "Pendente"
  },
  erro: {
    color: '#e9245a',
    label: "Erro ao salvar"
  },
  sending: {
    color: '#f1f11d',
    label: "Salvando..."
  }
}


export function downloadURI(uri: string, name: string) {
  var link = document.createElement('a');
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}