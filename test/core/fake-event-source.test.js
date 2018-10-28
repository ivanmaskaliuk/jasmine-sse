/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2018 Mickael Jeanroy
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import {fakeEventSourceFactory} from '../../src/core/fake-event-source.js';

describe('FakeEventSource', () => {
  let FakeEventSource;

  beforeEach(() => {
    FakeEventSource = fakeEventSourceFactory();
  });

  it('should define state contants', () => {
    expect(FakeEventSource.CONNECTING).toBe(0);
    expect(FakeEventSource.OPEN).toBe(1);
    expect(FakeEventSource.CLOSED).toBe(2);
  });

  it('should instantiate SSE connection', () => {
    const sse = new FakeEventSource('/stream');

    expect(sse.readyState).toBe(0);
    expect(sse.withCredentials).toBe(false);
    expect(sse.url).toBe('http://localhost:9876/stream');
  });

  it('should instantiate SSE connection with `withCredentials`', () => {
    const sse = new FakeEventSource('/stream', {
      withCredentials: true,
    });

    expect(sse.readyState).toBe(0);
    expect(sse.withCredentials).toBe(true);
    expect(sse.url).toBe('http://localhost:9876/stream');
  });
});
