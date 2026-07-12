import { IntersectionType } from '@nestjs/swagger';
import { BucketFileDto } from './s3bucket-upload.dto';
import { CreateContractDto } from './create-contract.dto';

/**
 * Payload único (multipart/form-data) para subir un documento y crear su
 * contrato en una sola petición. Combina los campos que envía el cliente:
 * - uploadType  (BucketFileDto)
 * - datos del contrato (CreateContractDto)
 *
 * Los datos del documento (s3_key, file_name, metadata) NO van aquí: los
 * deriva el servidor a partir del archivo.
 */
export class UploadDocumentDto extends IntersectionType(
  BucketFileDto,
  CreateContractDto,
) {}
