import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import VideoPlayer from './VideoPlayer';
import PdfViewer from './PdfViewer';

const Viewer = ({ isOpen, closeModal, contentType, contentId }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl h-5/6 transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    {contentType === 'Video' ? 'Video Player' : 'PDF Reader'}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </div>
                <div className="w-full h-5/6">
                  {contentType === 'Video' ? (
                    <VideoPlayer contentId={contentId} />
                  ) : (
                    <PdfViewer contentId={contentId} />
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Viewer;
