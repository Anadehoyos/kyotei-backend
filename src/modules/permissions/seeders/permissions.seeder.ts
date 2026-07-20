import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/entities/webapp/permissions/permission.entity';
import { Role } from 'src/entities/webapp/roles/role.entity';
import { In, Repository } from 'typeorm';

const PERMISSIONS: Pick<Permission, 'name' | 'description'>[] = [
  { name: 'ver_proveedores', description: 'Ver listado de proveedores' },
  { name: 'ver_detalle_proveedor', description: 'Ver detalle de un proveedor' },
  { name: 'crear_proveedor', description: 'Crear un nuevo proveedor' },
  { name: 'editar_proveedor', description: 'Editar datos de un proveedor' },
  { name: 'desactivar_proveedor', description: 'Desactivar un proveedor' },
  { name: 'ver_contratos', description: 'Ver listado de contratos' },
  { name: 'ver_detalle_contrato', description: 'Ver detalle de un contrato' },
  { name: 'crear_contrato', description: 'Crear un nuevo contrato' },
  { name: 'editar_contrato', description: 'Editar datos de un contrato' },
  { name: 'aprobar_contrato', description: 'Aprobar o rechazar un contrato' },
  { name: 'renovar_contrato', description: 'Renovar un contrato existente' },
  { name: 'cancelar_contrato', description: 'Cancelar un contrato' },
  { name: 'ver_documentos', description: 'Ver y descargar documentos' },
  { name: 'subir_documentos', description: 'Subir documentos a S3' },
  { name: 'eliminar_documentos', description: 'Eliminar documentos' },
  { name: 'ver_alertas', description: 'Ver alertas de vencimiento' },
  { name: 'ver_reportes', description: 'Ver reportes' },
  { name: 'exportar_reportes', description: 'Exportar reportes en CSV y PDF' },
  {
    name: 'gestionar_usuarios',
    description: 'Crear, editar y desactivar usuarios',
  },
  { name: 'asignar_roles', description: 'Asignar roles a usuarios' },
  {
    name: 'configurar_catalogos',
    description: 'Gestionar catálogos del sistema',
  },
  { name: 'gestionar_permisos', description: 'Gestionar roles y permisos' },
];

// admin recibe todos los permisos; el resto, subconjuntos según su función.
const ALL_PERMISSION_NAMES = PERMISSIONS.map((permission) => permission.name);

const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ALL_PERMISSION_NAMES,
  compras: [
    'ver_proveedores',
    'ver_detalle_proveedor',
    'crear_proveedor',
    'editar_proveedor',
    'ver_contratos',
    'ver_detalle_contrato',
    'crear_contrato',
    'editar_contrato',
    'ver_documentos',
    'subir_documentos',
    'ver_alertas',
    'ver_reportes',
    'exportar_reportes',
  ],
  legal: [
    'ver_proveedores',
    'ver_detalle_proveedor',
    'ver_contratos',
    'ver_detalle_contrato',
    'aprobar_contrato',
    'renovar_contrato',
    'ver_documentos',
    'subir_documentos',
    'ver_alertas',
    'ver_reportes',
    'exportar_reportes',
  ],
  viewer: [
    'ver_proveedores',
    'ver_detalle_proveedor',
    'ver_contratos',
    'ver_detalle_contrato',
    'ver_documentos',
    'ver_alertas',
    'ver_reportes',
  ],
};

@Injectable()
export class PermissionsSeeder implements OnModuleInit, OnApplicationBootstrap {
  private readonly logger = new Logger(PermissionsSeeder.name);

  constructor(
    @InjectRepository(Permission, 'webapp')
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(Role, 'webapp')
    private readonly roleRepository: Repository<Role>,
  ) {}

  // Siembra el catálogo de permisos (tabla plana).
  async onModuleInit() {
    await this.seedIfEmpty(
      this.permissionRepository,
      PERMISSIONS,
      'permissions',
    );
  }

  // La asignación rol->permiso corre en onApplicationBootstrap: NestJS garantiza
  // que este hook se ejecuta después de TODOS los onModuleInit, así que para este
  // punto los roles y los permisos ya están sembrados, sin depender del orden
  // entre seeders.
  async onApplicationBootstrap() {
    await this.assignRolePermissions();
  }

  private async assignRolePermissions() {
    for (const [roleName, permNames] of Object.entries(ROLE_PERMISSIONS)) {
      const role = await this.roleRepository.findOne({
        where: { name: roleName },
        relations: ['permissions'],
      });

      if (!role) {
        this.logger.warn(
          `Role "${roleName}" no encontrado, se omite la asignación de permisos`,
        );
        continue;
      }

      // Guard idempotente: solo sembramos el estado inicial. Si el rol ya tiene
      // permisos, no pisamos lo que se haya cambiado vía PUT /permissions/roles/:id.
      if (role.permissions.length > 0) {
        continue;
      }

      role.permissions = await this.permissionRepository.find({
        where: { name: In(permNames) },
      });
      await this.roleRepository.save(role);
      this.logger.log(
        `Asignados ${role.permissions.length} permisos al rol "${roleName}"`,
      );
    }
  }

  private async seedIfEmpty(
    repository: Repository<Permission>,
    data: Pick<Permission, 'name' | 'description'>[],
    name: string,
  ) {
    const count = await repository.count();
    if (count > 0) {
      return;
    }

    await repository.save(repository.create(data));
    this.logger.log(`Seeded ${name}`);
  }
}
