import React from 'react'

const PhotoSection = ({
  photoUrl,
  selectedRow,
  photoSectionRef,
  photoBoxRef,
}) => {
  return (
    <div
      className="w-[300px] bg-white flex-shrink-0 border border-border rounded-lg p-4 max-h-[610px] overflow-auto"
      id="photo-section"
      ref={photoSectionRef}
    >
      <div
        className="w-full h-96 bg-white border-2 border-border rounded-md flex items-center justify-center mb-4"
        id="photo-box"
        ref={photoBoxRef}
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt="Foto do produto"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <span className="text-muted-foreground">
            {photoUrl === null ? 'Foto não disponível' : 'Carregando foto...'}
          </span>
        )}
      </div>
      <div className="space-y-2">
        <p className="text-xl font-medium text-black">
          <strong>Cliente:</strong>{' '}
          <span className="text-muted-foreground">
            {selectedRow?.Cliente || 'N/A'}
          </span>
        </p>
        <p className="text-xl font-medium text-black">
          <strong>Op Interna:</strong>{' '}
          <span className="text-muted-foreground">
            {selectedRow?.['Op Interna'] || 'N/A'}
          </span>
        </p>
        <p className="text-xl font-medium text-black">
          <strong>Op Cliente:</strong>{' '}
          <span className="text-muted-foreground">
            {selectedRow?.['Op Cliente'] || 'N/A'}
          </span>
        </p>
        <p className="text-xl font-medium text-black">
          <strong>Referência:</strong>{' '}
          <span className="text-muted-foreground">
            {selectedRow?.Referencia || 'N/A'}
          </span>
        </p>
        <p className="text-xl font-medium text-black">
          <strong>Quantidade:</strong>{' '}
          <span className="text-muted-foreground">
            {selectedRow?.Quantidade || 'N/A'}
          </span>
        </p>
      </div>
    </div>
  )
}

export default PhotoSection
