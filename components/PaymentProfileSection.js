import React from "react";
import { FaPen, FaSpinner } from "react-icons/fa";

const PaymentProfileSection = ({
  username,
  currentUser,
  isOwner,
  isUploadingProfile,
  isUploadingCover,
  profileInputRef,
  coverInputRef,
  handleProfileChange,
  handleCoverChange,
  isEditing,
  setIsEditing,
  handleSaveDescription,
  eventDuration,
  setEventDuration,
  handleStartEvent,
  handleEndEvent,
  timeLeft,
  handleSavePerk,
  setcurrentUser,
}) => {
  return (
    <>
      {/* Banner with full width and profile image overlapping bottom edge */}
      <div className="relative w-full mx-auto">
        {/* Background image with upload for owner and change banner button */}
        <div
          className={`w-full h-64 md:h-72 lg:h-80 bg-cover bg-center shadow-md relative ${isOwner ? '' : ''}`}
          style={{ backgroundImage: `url(${currentUser?.coverpic || "https://picsum.photos/1600/400"})` }}
        >
          <div className="absolute inset-0 bg-background/40" />
          {isOwner && (
            <>
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                ref={coverInputRef}
                onChange={handleCoverChange}
                disabled={isUploadingCover}
              />
              <button
                type="button"
                className={`absolute bottom-4 right-4 z-10 bg-primary text-text px-4 py-2 rounded-lg shadow hover:bg-primary/90 transition font-semibold text-sm flex items-center gap-2 ${isUploadingCover ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={() => !isUploadingCover && coverInputRef.current.click()}
                disabled={isUploadingCover}
              >
                {isUploadingCover ? <FaSpinner className="animate-spin text-text text-lg" /> : null}
                Change Banner
              </button>
            </>
          )}
        </div>
        {/* Profile image, centered and overlapping bottom edge, with upload for owner */}
        <div className="absolute left-1/2 bottom-0 translate-x-[-50%] translate-y-1/2 flex justify-center items-center w-full pointer-events-none">
          <div className={`w-36 h-36 md:w-40 md:h-40 bg-text rounded-full shadow-lg border-4 border-text overflow-hidden flex items-center justify-center relative ${isOwner ? 'group cursor-pointer' : ''}`}
            onClick={isOwner && !isUploadingProfile ? () => profileInputRef.current.click() : undefined}
            style={{ opacity: isUploadingProfile ? 0.6 : 1 }}
          >
            <img
              src={currentUser?.profilepic || "https://picsum.photos/200"}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
              style={{ filter: isUploadingProfile ? 'blur(2px)' : 'none' }}
            />
            {isOwner && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  ref={profileInputRef}
                  onChange={handleProfileChange}
                  disabled={isUploadingProfile}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-auto">
                  <div className="bg-background/70 backdrop-blur-md rounded-full p-3 flex items-center justify-center">
                    {isUploadingProfile ? <FaSpinner className="animate-spin text-primary text-xl" /> : <FaPen className="text-xl text-primary" />}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Add margin below the banner to account for the overlapping profile image */}
      <div className="h-20" />

      {/* Profile Info Box */}
      <div className="relative mt-20 w-full max-w-md mx-auto p-6 bg-text/10 border border-text/20 backdrop-blur-md shadow-md rounded-lg">
        <h1 className="text-xl font-bold text-text text-center">@{username}</h1>
        {/* Description */}
        {isOwner ? (
          <>
            <textarea
              className="w-full mt-2 bg-background border border-text/20 text-text text-sm text-center rounded p-2 resize-none focus:ring-2 focus:ring-primary outline-none"
              value={currentUser.description || ""}
              onFocus={() => setIsEditing(true)}
              onChange={(e) => setcurrentUser({ ...currentUser, description: e.target.value })}
            />
            {isEditing && (
              <button onClick={handleSaveDescription} className="w-full mt-2 bg-primary hover:bg-primary/80 text-text px-4 py-2 rounded text-sm font-semibold">
                Save Description
              </button>
            )}
          </>
        ) : (
          <p className="text-sm text-text/70 text-center mt-2">{currentUser.description}</p>
        )}

        {/* Perk Display */}
        {(currentUser.perk || (currentUser.payments && currentUser.payments.length > 0)) && (
          <div className="mt-6 bg-text/5 border border-text/20 p-4 rounded-lg">
            {currentUser.perk && (
              <div className="text-text/90 text-sm text-center mb-3">
                🎁 <span className="font-semibold text-accent">Top 5 Donor Perk:</span> {currentUser.perk}
              </div>
            )}
          </div>
        )}

        {/* Owner-only controls */}
        {isOwner && (
          <div className="mt-4 space-y-2">
            <input
              type="text"
              value={currentUser.perk || ""}
              onChange={(e) => setcurrentUser({ ...currentUser, perk: e.target.value })}
              onBlur={handleSavePerk}
              placeholder="Set your perk for top donors"
              className="w-full px-3 py-2 bg-background border border-text/20 text-text rounded focus:ring-2 focus:ring-primary outline-none"
            />
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
              <input type="number" placeholder="Duration in days" value={eventDuration} onChange={(e) => setEventDuration(e.target.value)}
                className="w-full sm:min-w-[180px] sm:flex-1 px-3 py-2 bg-background border border-text/20 text-text rounded focus:ring-2 focus:ring-primary outline-none"
              />
              <button onClick={handleStartEvent} className="w-full sm:w-auto bg-success hover:bg-success/80 text-text px-4 py-2 rounded text-sm font-semibold">
                Start Event
              </button>
              <button onClick={handleEndEvent} className="w-full sm:w-auto bg-error hover:bg-error/80 text-text px-4 py-2 rounded text-sm font-semibold">
                End Event
              </button>
            </div>
          </div>
        )}

        {/* Event Timer */}
        {currentUser.eventEnd && timeLeft && (
          <div className="mt-4 text-center bg-background/80 border border-primary/30 text-text/80 text-sm py-2 px-3 rounded-md shadow-sm">
            ⏳ <span className="font-semibold text-primary">Event is live!</span> Ends in: <span className="font-semibold">{timeLeft}</span>
          </div>
        )}
      </div>
    </>
  );
};

export default PaymentProfileSection;
