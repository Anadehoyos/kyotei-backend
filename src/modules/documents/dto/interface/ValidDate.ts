import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isAfter', async: false })
export class IsAfterConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments) {
    const [relatedProperty] = args.constraints as [string];
    const relatedValue = (args.object as Record<string, unknown>)[
      relatedProperty
    ];

    if (!relatedProperty) {
      return false;
    }

    const date = new Date(value as string | number | Date);
    const relatedDate = new Date(relatedValue as string | number | Date);

    if (isNaN(date.getTime()) || isNaN(relatedDate.getTime())) {
      return false;
    }

    return date > relatedDate;
  }

  defaultMessage(args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints as [string];
    return `$property must be after ${relatedPropertyName}`;
  }
}

export function IsAfter(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsAfterConstraint,
    });
  };
}
