export type CreatePersonEntityProps = {
  first_name: string;
  middle_name?: string;
  last_name: string;
  ssn?: string;
  passport?: {
    number: string;
    country_code: string;
  };
  date_of_birth: string;
  email: string;
  address: {
    line_1: string;
    line_2?: string;
    city: string;
    state: string;
    postal_code?: string;
    country_code: string;
  }
}

export class ColumnError extends Error {

  public readonly status_code: number;
  public readonly type: string;
  public readonly code: string;
  public readonly documentation_url: string;
  public readonly details: string;

  constructor(status_code: number, response: {
    type: string;
    code: string;
    message: string;
    documentation_url: string;
    details: string;
  }) {
    super(response.message);
    this.status_code = status_code;
    this.type = response.type;
    this.code = response.code;
    this.documentation_url = response.documentation_url;
    this.details = response.details;
  }

  toJSON() {
    return {
      status_code: this.status_code,
      type: this.type,
      code: this.code,
      message: this.message,
      documentation_url: this.documentation_url,
      details: this.details,
    }
  }

  toString() {
    return JSON.stringify(this.toJSON());
  }
}

const buildColumnRequest = async <T>(path: string, method: 'get' | 'post', body?: T) => {

  const api_key = Deno.env.get('COLUMN_API_KEY')!;
  const endpoint = Deno.env.get('COLUMN_API_URL')!;

  console.log(api_key);
  console.log(Buffer.from(api_key));
  console.log(Buffer.from(api_key).toString('base64'));
  console.log('-----');

  const response = await fetch(endpoint + path, {
    method,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(api_key).toString('base64')
    },
    ...(body && {body: JSON.stringify(body)}),
  });
  console.log(response.ok);
  console.log(response.status);
  console.log(response.statusText);

  if(response.ok) {
    return response.json();
  }
  else {
    throw new ColumnError(response.status, await response.json());
  }
}

const column = {
  entities: {
    create: (entity: CreatePersonEntityProps) => buildColumnRequest('/entities/person', 'post', entity),
    list: () => buildColumnRequest('/entities', 'get')
  }
}

export default column;