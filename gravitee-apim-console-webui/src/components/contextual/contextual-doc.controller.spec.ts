import ContextualDocController from './contextual-doc.controller';

const INDEX_HTML = `<!--
    Copyright (C) 2015 The Gravitee team (http://gravitee.io)
-->
<!doctype html>
<html class="mat">
  <head><base href="/" /><title ng-bind="consoleTitle"></title></head>
  <body><div class="gravitee-splash-screen">Loading Gravitee console</div></body>
</html>`;

const RUSSIAN = `# Регистрация клиентов

Текст <a href="https://openid.net/specs/openid-connect-registration-1_0.html">спецификация</a>.
`;

const ENGLISH = `# Client Registration

English help <a href="https://openid.net/specs/openid-connect-registration-1_0.html">specification</a>.
`;

describe('ContextualDocController fallback', () => {
  const flush = async () => {
    for (let step = 0; step < 5; step += 1) {
      await Promise.resolve();
    }
  };

  const create = (get: (url: string) => Promise<{ data: string }>) => {
    const $http = { get: jest.fn(get) };
    const controller = new ContextualDocController($http);
    return { controller, $http };
  };

  it('renders the russian page when the russian file exists', async () => {
    const { controller, $http } = create(url => {
      if (url === './docs/ru/management-api.md') {
        return Promise.resolve({ data: RUSSIAN });
      }
      return Promise.reject({ status: 404 });
    });
    controller.language = 'ru';

    controller.changeDocumentationPage('management-api');
    await flush();

    expect($http.get).toHaveBeenCalledTimes(1);
    expect(controller.page.content).toContain('Регистрация клиентов');
    expect(controller.page.content).toContain('https://openid.net/specs/openid-connect-registration-1_0.html');
    expect(controller.page.content).not.toContain('gravitee-splash-screen');
  });

  it('keeps a markdown page that starts with an allowed html fragment', async () => {
    const markdown = '<a href="https://openid.net/specs/openid-connect-registration-1_0.html">specification</a>\n';
    const { controller, $http } = create(() => Promise.resolve({ data: markdown }));
    controller.language = 'ru';

    controller.changeDocumentationPage('management-api');
    await flush();

    expect($http.get).toHaveBeenCalledTimes(1);
    expect(controller.page.content).toContain('https://openid.net/specs/openid-connect-registration-1_0.html');
  });

  it('renders english help when the russian file responds with HTTP 404', async () => {
    const { controller } = create(url => {
      if (url === './docs/ru/management-api.md') {
        return Promise.reject({ status: 404 });
      }
      return Promise.resolve({ data: ENGLISH });
    });
    controller.language = 'ru';

    controller.changeDocumentationPage('management-api');
    await flush();

    expect(controller.page.content).toContain('Client Registration');
    expect(controller.page.content).not.toContain('gravitee-splash-screen');
  });

  it('renders english help when the russian file responds with HTTP 200 and the application HTML', async () => {
    const { controller } = create(url => {
      if (url === './docs/ru/management-api.md') {
        return Promise.resolve({ data: INDEX_HTML });
      }
      return Promise.resolve({ data: ENGLISH });
    });
    controller.language = 'ru';

    controller.changeDocumentationPage('management-api');
    await flush();

    expect(controller.page.content).toContain('Client Registration');
    expect(controller.page.content).not.toContain('gravitee-splash-screen');
    expect(controller.page.content).not.toContain('<!doctype html>');
  });

  it('clears the panel when neither the russian nor the english file exists', async () => {
    const missing = create(() => Promise.reject({ status: 404 }));
    missing.controller.language = 'ru';
    missing.controller.page.content = '<p>previous</p>';

    missing.controller.changeDocumentationPage('management-api');
    await flush();

    expect(missing.controller.page.content).toBe('');

    const htmlShell = create(() => Promise.resolve({ data: INDEX_HTML }));
    htmlShell.controller.language = 'ru';
    htmlShell.controller.page.content = '<p>previous</p>';

    htmlShell.controller.changeDocumentationPage('management-api');
    await flush();

    expect(htmlShell.controller.page.content).toBe('');
  });

  it('keeps the latest response when the language changes before the previous request finishes', async () => {
    let resolveRussian: (value: { data: string }) => void = () => undefined;
    const russian = new Promise<{ data: string }>(resolve => {
      resolveRussian = resolve;
    });
    const { controller } = create(url => {
      if (url === './docs/ru/management-api.md') {
        return russian;
      }
      return Promise.resolve({ data: ENGLISH });
    });

    controller.language = 'ru';
    controller.changeDocumentationPage('management-api');
    controller.language = 'en';
    controller.changeDocumentationPage('management-api');
    await flush();

    expect(controller.page.content).toContain('Client Registration');

    resolveRussian({ data: RUSSIAN });
    await flush();

    expect(controller.page.content).toContain('Client Registration');
    expect(controller.page.content).not.toContain('Регистрация клиентов');
  });
});
