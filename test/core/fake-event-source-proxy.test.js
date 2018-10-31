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
import {fakeEventSourceProxyFactory} from '../../src/core/fake-event-source-proxy.js';

describe('FakeEventSource', () => {
  let FakeEventSource;
  let FakeEventSourceProxy;

  beforeEach(() => {
    FakeEventSource = fakeEventSourceFactory();
    FakeEventSourceProxy = fakeEventSourceProxyFactory();
  });

  it('should define state contants', () => {
    expect(FakeEventSourceProxy.CONNECTING).toBe(0);
    expect(FakeEventSourceProxy.OPEN).toBe(1);
    expect(FakeEventSourceProxy.CLOSED).toBe(2);
  });

  it('should create SSE connection proxy', () => {
    const sse = new FakeEventSource('/stream');
    const proxy = new FakeEventSourceProxy(sse);

    expect(proxy.readyState).toBe(0);
    expect(proxy.withCredentials).toBe(false);
    expect(proxy.url).toBe('http://localhost:9876/stream');
  });

  describe('once created', () => {
    let sse;
    let proxy;

    beforeEach(() => {
      sse = new FakeEventSource('/stream');
      proxy = new FakeEventSourceProxy(sse);

      spyOn(sse, 'addEventListener').and.callThrough();
      spyOn(sse, 'removeEventListener').and.callThrough();
      spyOn(sse, 'dispatchEvent').and.callThrough();
    });

    it('should initialize handlers to null', () => {
      expect(proxy.onerror).toBeNull();
      expect(proxy.onopen).toBeNull();
      expect(proxy.onmessage).toBeNull();
    });

    it('should set ws handlers', () => {
      sse.onerror = jasmine.createSpy('onerror');
      sse.onopen = jasmine.createSpy('onopen');
      sse.onmessage = jasmine.createSpy('onmessage');

      expect(proxy.onerror).toBe(sse.onerror);
      expect(proxy.onopen).toBe(sse.onopen);
      expect(proxy.onmessage).toBe(sse.onmessage);
    });

    it('should define ws handlers from proxy', () => {
      const onerror = jasmine.createSpy('onerror');
      const onopen = jasmine.createSpy('onopen');
      const onmessage = jasmine.createSpy('onmessage');

      proxy.onerror = onerror;
      proxy.onopen = onopen;
      proxy.onmessage = onmessage;

      expect(proxy.onerror).toBe(onerror);
      expect(proxy.onopen).toBe(onopen);
      expect(proxy.onmessage).toBe(onmessage);

      expect(proxy.onerror).toBe(sse.onerror);
      expect(proxy.onopen).toBe(sse.onopen);
      expect(proxy.onmessage).toBe(sse.onmessage);
    });

    it('should add event listener', () => {
      const type = 'open';
      const listener = jasmine.createSpy('listener');

      proxy.addEventListener(type, listener);

      expect(sse.addEventListener).toHaveBeenCalledWith(type, listener);
    });

    it('should remove event listener', () => {
      const type = 'open';
      const listener = jasmine.createSpy('listener');

      proxy.removeEventListener(type, listener);

      expect(sse.removeEventListener).toHaveBeenCalledWith(type, listener);
    });

    it('should dispatch event', () => {
      const event = {type: 'open'};

      proxy.dispatchEvent(event);

      expect(sse.dispatchEvent).toHaveBeenCalledWith(event);
    });

    it('should emit data', () => {
      const data = 'test';
      const onOpenListener = jasmine.createSpy('onOpenListener');
      const onMessageListener = jasmine.createSpy('onMessageListener');

      proxy.addEventListener('open', onOpenListener);
      proxy.addEventListener('message', onMessageListener);
      proxy.emit(data);

      expect(proxy.readyState).toBe(1);
      expect(sse.readyState).toBe(1);

      expect(onOpenListener).toHaveBeenCalledTimes(1);
      expect(onMessageListener).toHaveBeenCalledTimes(1);

      const e1 = onOpenListener.calls.mostRecent().args[0];
      expect(e1.type).toBe('open');
      expect(e1.target).toBe(sse);

      const e2 = onMessageListener.calls.mostRecent().args[0];
      expect(e2.type).toBe('message');
      expect(e2.data).toBe(data);
      expect(e2.target).toBe(sse);
    });

    it('should emit data with custom type', () => {
      const onOpenListener = jasmine.createSpy('onOpenListener');
      const onMessageListener = jasmine.createSpy('onMessageListener');
      const onCustomEventListener = jasmine.createSpy('onCustomEventListener');
      const data = {type: 'customevent', data: 'test'};

      proxy.addEventListener('open', onOpenListener);
      proxy.addEventListener('message', onMessageListener);
      proxy.addEventListener('customevent', onCustomEventListener);
      proxy.emit(data);

      expect(onOpenListener).toHaveBeenCalledTimes(1);
      expect(onCustomEventListener).toHaveBeenCalledTimes(1);
      expect(onMessageListener).not.toHaveBeenCalled();

      const e1 = onOpenListener.calls.mostRecent().args[0];
      expect(e1.type).toBe('open');
      expect(e1.target).toBe(sse);

      const e2 = onCustomEventListener.calls.mostRecent().args[0];
      expect(e2.type).toBe('customevent');
      expect(e2.data).toBe(data.data);
      expect(e2.target).toBe(sse);
    });

    it('should fail to emit null data', () => {
      expect(() => proxy.emit(null)).toThrow(new Error(
          `Failed to emit message on 'EventSource': The message is null.`
      ));
    });

    it('should fail to emit undefined data', () => {
      expect(() => proxy.emit(undefined)).toThrow(new Error(
          `Failed to emit message on 'EventSource': The message is undefined.`
      ));
    });

    it('should fail to emit function as data', () => {
      expect(() => proxy.emit(() => {})).toThrow(new Error(
          `Failed to emit message on 'EventSource': The message is function () {}.`
      ));
    });

    describe('once opened', () => {
      beforeEach(() => {
        proxy.emit('open connection');
      });

      it('should not trigger open listener if connection is already opened', () => {
        const onOpenListener = jasmine.createSpy('onOpenListener');
        const onMessageListener = jasmine.createSpy('onMessageListener');
        const data = 'second message';

        proxy.addEventListener('open', onOpenListener);
        proxy.addEventListener('message', onMessageListener);
        proxy.emit(data);

        expect(onOpenListener).not.toHaveBeenCalled();
        expect(onMessageListener).toHaveBeenCalledTimes(1);

        const event = onMessageListener.calls.mostRecent().args[0];
        expect(event.type).toBe('message');
        expect(event.data).toBe(data);
        expect(event.target).toBe(sse);
      });
    });
  });
});